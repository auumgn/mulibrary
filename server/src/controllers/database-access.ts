import pg from 'pg'
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { Scrobble } from '../models/scrobble.model';
import { ITrack, Track } from '../models/track.model';
import * as config from "../db/config.json";
import { stringDistance } from './distance-checker';
import promptSync from "prompt-sync";
const Pool = pg.Pool;
const prompt = promptSync();
const debug = true;

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: config.password,
})

export const createAlbum = async (album: Album): Promise<Album | null> => {
  const existingAlbums = await getAlbumByName(album.name, album.artist);
  if (existingAlbums && existingAlbums.length !== 0) {
    console.error("Duplicate album", existingAlbums[0].name, existingAlbums[0].artist);
    const album = new Album(existingAlbums[0].artist, existingAlbums[0].artist_id, existingAlbums[0].name, existingAlbums[0].year, existingAlbums[0].genre, existingAlbums[0].artwork, existingAlbums[0].id);
    return album;
  } else {
    const query = {
      text: 'INSERT INTO album(name, artist, year, category, artwork, artist_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [album.name, album.artist, album.year, album.category, album.artwork, album.artist_id],
    }
    //console.log('');
    console.log('Creating album', album.name, album.artist);
    let res: Album[] = await executeQuery(query);
    if (res && res.length > 0) {
      album.id = res[0].id;
      const newQuery = {
        text: 'INSERT INTO "albumArtist"(artist, artist_id, album, album_id) VALUES($1, $2, $3, $4) RETURNING *',
        values: [album.artist[0], album.artist_id[0], album.name, album.id]
      }
      await executeQuery(newQuery);
      return album;
    } else {
      return null;
    }
  }
}

export const updateArtwork = async (album: Album): Promise<Album | null> => {

  const query = {
    text: `UPDATE album set artwork = array_append(artwork, $1) where ID = $2 RETURNING *`,
    values: [album.artwork, album.id],
  }
  console.log('');
  console.log('Updating artwork', album.name, album.artist);
  const res: Album[] = await executeQuery(query);

  if (res && res.length > 0) {
    const album = new Album(res[0].name, res[0].artist, res[0].artist_id, res[0].year, res[0].genre, res[0].artwork, res[0].id, res[0].tracks, res[0].other_names, res[0].category);
    return album;
  } else {
    return null;
  }
}

const getAlbumByName = async function (album: string, artist: string[]) {
  let query = {
    text: `SELECT al.* from album al inner join "albumArtist" aa on al.id = aa.album_id
    INNER JOIN artist ar on ar.id = aa.artist_id 
    WHERE (lower(al.name) = $1 or $1 ILIKE any(al.other_names)) 
    AND ($2::text[] && (ar.other_names) OR lower(ar.name) = any($2::text[]))`,
    values: [album.toLowerCase(), artist.map(a => a.toLowerCase())],
  }
  if (debug) console.log("getalbum by name", query);
  
  const res = await executeQuery(query);
  return res;
}

export const createArtist = async (artist: Artist): Promise<Artist | null> => {
  const existingArtists = await getArtistByName(artist.name);
  if (existingArtists && existingArtists.length !== 0) {
    console.error("Duplicate artist", existingArtists[0].name);
    const artist = new Artist(existingArtists[0].name, existingArtists[0].category, existingArtists[0].genre, existingArtists[0].id, existingArtists[0].other_names);
    return artist;
  } else {
    const query = {
      text: 'INSERT INTO artist(name, category) VALUES($1, $2) RETURNING *',
      values: [artist.name, artist.category],
    }
    console.log('');
    console.log('Creating artist', artist.name);
    const res: Artist[] = await executeQuery(query);
    if (res && res.length > 0) {
      const artist = new Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_names);
      return artist;
    } else {
      return null;
    }
  }
}

export const updateArtist = async (artist: Artist): Promise<Artist | null> => {

  const query = {
    text: 'UPDATE artist set (name, category, genre, other_names) = (COALESCE($1, name), COALESCE($2, category), ($3, genre), array_append(other_names, $4)) where id = $5 RETURNING *',
    values: [artist.name, artist.category, artist.genre, artist.other_names, artist.id],
  }
  //console.log('');
  //console.log('Updating artist', artist.name);
  const res: Artist[] = await executeQuery(query);
  if (res && res.length > 0) {
    const artist = new Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_names);
    return artist;
  } else {
    return null;
  }

}

const getArtistByName = async function (name: string, extended?: boolean): Promise<Artist[]> {
  const query = {
    text: 'SELECT * from artist where lower(name) = $1 or $1 ILIKE any(other_names)',
    values: [name.toLowerCase()],
  }
  if (extended) {
    query.text = query.text.replace(/=/g, "LIKE");
    query.values = query.values.map(value => '%' + value + '%');
  }
  const res = await executeQuery(query);
  return res;
}

export const createTrack = async (track: ITrack): Promise<Track | null> => {
  const existingTracks = await getTrackByName(track.name, track.artist, track.album_id, track.track_no);
  if (existingTracks && existingTracks.length !== 0) {
    //console.error("Duplicate track", existingTracks);
    return null;
  } else {
    const query = {
      text: 'INSERT INTO track(name, artist, album, track_no, category, duration, year, genre, album_id, artist_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      values: [track.name, track.artist, track.album, track.track_no, track.category, track.duration, track.year, track.genre, track.album_id, track.artist_id],
    }
    //console.log('Creating track', track.name);
    const res: Track[] = await executeQuery(query);
    // add id and other names from DB as local file will not provide this 
    if (res && res.length > 0) {
      track.id = res[0].id;
      track.other_names = res[0].other_names;
      //const track = new Track(res[0].name, res[0].artist, res[0].artist_id, res[0].album, res[0].album_id, res[0].duration, res[0].track_no, res[0].category, res[0].year, res[0].genre, res[0].id, res[0].other_names);
      const newQuery = {
        text: 'INSERT INTO "trackArtist"(artist, artist_id, track, track_id) VALUES($1, $2, $3, $4) RETURNING *',
        values: [track.artist[0], track.artist_id[0], track.name, track.id]
      }
      await executeQuery(newQuery);
      return track;
    } else {
      return null;
    }
  }
}
/*
export const updateTrack = async (track: Track): Promise<Track | null> => {
  
  const query = {
    text: 'UPDATE track set (pla, category, genre, other_names) = (COALESCE($1, name), COALESCE($2, category), ($3, genre), array_append(COALESCE($4, ''))) where id = $5 RETURNING *',
    values: [artist.name, artist.category?.name, artist.genre, artist.other_names, artist.id],
  }
  //console.log('');
  //console.log('Updating artist', artist.name);
  const res: Track[] = await executeQuery(query);
  if (res && res.length > 0) {
    const track = new Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_names);
    return track;
  } else {
    return null;
  }
  
}
*/
// TODO readjust for the trackArtist table
const getTrackByName = async function (name: string, artist: string[], album_id?: number, track_no?: number) {
  let query = {
    text: `SELECT t.* from track t INNER JOIN "trackArtist" ta ON t.id = ta.track_id
    INNER JOIN artist a ON ta.artist_id = a.id
    WHERE (lower(t.name) = $1 or $1 ILIKE any(t.other_names))
    AND (($3::integer IS NULL AND ($2 && a.other_names OR lower(a.name) ILIKE ANY($2))) or t.album_id = $3::integer)
    AND (t.track_no = $4 OR $4 IS NULL)`,
    values: [name.toLowerCase(), artist.map(a => a.toLowerCase()), album_id, track_no],
  }
  if (debug) console.log("get track by name", query, );

  // execute query and return result
  const res = await executeQuery(query);
  console.log("what", res);
  
  return res;
}

const getEntryById = async function (type: string, id: number) {
  const res = await executeQuery(`SELECT * from ${type} where id = ${id.toString()}`);
  return res;
}

const updateOtherNames = async (type: string, newOtherName: string, id: number) => {
  const query = {
    text: `UPDATE ${type} set other_names = array_append(other_names, $1) where id = $2 RETURNING *`,
    values: [newOtherName, id],
  }
  const res = await executeQuery(query);
  return res;
}

export const addPlaycount = async function (scrobble: Scrobble): Promise<Track> {
  // names found in the database
  let artist: Artist;
  let album: Album;
  let track: Track;

  // find exact name
  const matchingArtist = await getArtistByName(scrobble.artist);
  // if there's 0 results or more than 1, get closest match (no more than 3 char difference)
  if (matchingArtist.length === 1) {
    artist = matchingArtist[0];
  } else {
    artist = await findOrCreateArtist(scrobble);
    if (!artist) throw new Error('Artist not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
    // add alternative look up name from the scrobble to avoid future queries
    await updateOtherNames("artist", scrobble.artist, artist.id);
  }

  // repeat for album and track
  const matchingAlbum = await getAlbumByName(scrobble.album, [artist.name]);
  if (matchingAlbum.length === 1) {
    album = matchingAlbum[0];
  } else {
    album = await findOrCreateAlbum(scrobble, artist);
    if (!album) throw new Error('Album not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
    await updateOtherNames("album", scrobble.album, album.id);
  }

  const matchingTrack = await getTrackByName(scrobble.name, [artist.name], album.id || null);
  console.log(matchingTrack);
  
  if (matchingTrack.length === 1) {
    track = matchingTrack[0];
  } else {
    track = await findOrCreateTrack(scrobble, artist, album);
    if (!track) throw new Error('Track not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
    await updateOtherNames("track", scrobble.name, track.id);

  }

  const query = {
    text: 'UPDATE track set plays = plays + 1 where id = $1 RETURNING *',
    values: [track.id],
  }

  const res = await executeQuery(query);
  if (res && res.length > 0) {
    return res[0];
  } else {
    return null;
  }
}

const findOrCreateArtist = async (scrobble: Scrobble): Promise<Artist> => {
  const artistsInDatabase = await executeQuery({ text: 'SELECT name, id from artist' });
  if (!artistsInDatabase) {
    return null
  }
  console.log(`Missing artist, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  console.log("Closest db names: ");
  const closestEntries: ClosestEntries = findClosestEntries(artistsInDatabase, scrobble.artist);
  const artist: UserRequest = await promptUserAndProcess("artist", closestEntries, scrobble.artist);
  if (artist.newEntryName !== undefined) {
    const newArtist = new Artist(artist.newEntryName);
    artist.data = await createArtist(newArtist);
  }
  return artist.data as Artist;
}

// Only to be used in the "addplaycount" method, as it expects an existing artist??
const findOrCreateAlbum = async (scrobble: Scrobble, artist: Artist): Promise<Album> => {
  const query = { text: "SELECT name, id from album where $1 = any(artist_id)", values: [artist.id] };
  if (debug) console.log("findOrCreateAlbum", query);
  
  const albumsInDatabase = await executeQuery(query);
  if (!albumsInDatabase) {
    return null
  }

  console.log(`Missing album, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  console.log("Closest db names: ");
  const closestEntries: ClosestEntries = findClosestEntries(albumsInDatabase, scrobble.album);
  const album: UserRequest = await promptUserAndProcess("album", closestEntries, scrobble.album);
  if (album.newEntryName !== undefined) {
    const newAlbum = new Album(album.newEntryName, [artist.name], [artist.id], null, artist.genre, null, null, null, null, artist.category);
    album.data = await createAlbum(newAlbum);
  }
  return album.data as Album;
}

// Only to be used in the "addplaycount" method, as it expects an existing artist and album??
const findOrCreateTrack = async (scrobble: Scrobble, artist: Artist, album: Album): Promise<Track> => {
  const query = {
    text: "SELECT name, id from track where album_id = $1",
    values: [album.id]
  }
  if (debug) console.log("findOrCreateTrack", query);
  const tracksInDatabase = await executeQuery(query);
  console.log(tracksInDatabase);
  
  if (!tracksInDatabase) {
    return null
  }

  console.log(`Missing track, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  console.log("Closest db names: ");
  const closestEntries: ClosestEntries = findClosestEntries(tracksInDatabase, scrobble.name);
  if (closestEntries && closestEntries['0']) {}
  const track: UserRequest = await promptUserAndProcess("track", closestEntries, scrobble.name);
  if (track.newEntryName !== undefined) {
    const newTrack = new Track(track.newEntryName, [artist.name], [artist.id], album.name, album.id, null, null, artist.category, album.year, album.genre);
    track.data = await createTrack(newTrack);
  }
  return track.data as Track;
}

type UserRequest = {
  data?: Artist | Album | Track,
  newEntryName?: string
}

const promptUserAndProcess = async (type: string, closestEntries: ClosestEntries, scrobbleName: string): Promise<UserRequest> => {
  let validId = false;
  const userPrompt: UserRequest = {};
  // There might be more than 1 identical matches (e.g. two tracks with identical names on the same album)
  // We don't have enough information in the scrobble to differentiate between them, so return any first match
  if (closestEntries && closestEntries['0']) {
    const res: Artist[] | Album[] | Track[] = await getEntryById(type, closestEntries['0'][0].id);
      if (res && res.length > 0) {
        userPrompt.data = res[0];
        return userPrompt;
      }
  }
  // Otherwise let the person choose by himself
  while (!validId) {
    let existingEntryIndex = prompt(`Please choose ${type} id from the array above: `);
    // artist/album/track chosen from the provided options
    // is it a number?
    if (!isNaN(existingEntryIndex)) {
      const match: Artist | Album | Track = Object.values(closestEntries).flat().find((entry: Artist) => entry.id === +existingEntryIndex);
      if (match && match.id) {
        validId = true;
        userPrompt.data = match;
        return userPrompt;
      }
      // provide your own id for existing artist/album/track
    } else if (existingEntryIndex.startsWith("id")) {
      const res: Artist[] | Album[] | Track[] = await getEntryById(type, existingEntryIndex.slice(2));
      if (res && res.length > 0) {
        validId = true;
        userPrompt.data = res[0];
        return userPrompt;
      }
      else {
        console.log("Invalid id provided");
      }
      // create new artist/album/track
    } else if (existingEntryIndex === "create") {
      userPrompt.newEntryName = scrobbleName;
      return userPrompt;
    } else if (existingEntryIndex === "skip") {
      return undefined;
    } else if (existingEntryIndex === "quit") {
      process.exit();
    }
  }
}

interface ClosestEntries {
  [key: number]: (Artist[] | Album[] | Track[]);
}

const findClosestEntries = (databaseEntries: any, entryName: string): ClosestEntries => {
  let distance: number;
  const closestEntries: ClosestEntries = {};
  for (let i = 0; i < databaseEntries.length; i++) {
    distance = stringDistance(databaseEntries[i].name.toLowerCase(), entryName.toLowerCase());
    if (!closestEntries[distance]) {
      closestEntries[distance] = [];
    }
    closestEntries[distance].push(databaseEntries[i])
  }
  const sortedEntries = Object.keys(closestEntries).map(Number).sort((a, b) => (a - b));
  let sortedEntriesLimit = 0;
  for (let i = 0; i < sortedEntries.length; i++) {
    if (sortedEntriesLimit === 3) break;
    console.log(sortedEntries[i], closestEntries[sortedEntries[i]]);
    sortedEntriesLimit++;
  }
  return closestEntries;
}

/****************************************************************************************************************************************** */

export const insertScrobble = async (scrobble: Scrobble) => {
  const query = {
    text: 'INSERT into scrobbles(name, artist, album, timestamp, track_id, artist_id, album_id, category) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
    values: [scrobble.name, scrobble.artist, scrobble.album, scrobble.timestamp, scrobble.track_id, scrobble.artist_id, scrobble.album_id, scrobble.category],
  }
  const res = await executeQuery(query);
  return res;
}

export const getLatestScrobbleTimestamp = async () => {
  const query = {
    text: 'select timestamp from scrobbles order by timestamp desc limit 1',
  }
  const res = await executeQuery(query);
  return res;
}

export const rollbackScrobbleImport = async (timestamp: number, scrobbleTimestamp: number) => {
  let query = {
    text: 'remove from sync_timestamp where timestamp > $1',
    values: [timestamp],
  }
  const res = await executeQuery(query);

  query = {
    text: 'remove from scrobbles where timestamp > $1',
    values: [scrobbleTimestamp],
  }
  const res2 = await executeQuery(query);
  return [res, res2]
}

/*********************************************************************************************************************** */

export const insertSyncTimestamp = async (timestamp: number) => {
  const query = {
    text: 'INSERT into sync_timestamp(timestamp) VALUES($1)',
    values: [timestamp],
  }
  const res = await executeQuery(query);
  return res;
}

export const getRecentTimestamp = async () => {
  const query = {
    text: 'select timestamp from sync_timestamp order by timestamp desc limit 1',
  }
  const res = await executeQuery(query);
  return res;
}

/*********************************************************************************************************************** */

export const deleteTracksAlbumsArtists = async function () {
  await executeQuery({ text: 'DELETE FROM "trackArtist"' });
  await executeQuery({ text: 'DELETE FROM "albumArtist"' });
  await executeQuery({ text: 'DELETE FROM track' });
  await executeQuery({ text: 'DELETE FROM album' });
  await executeQuery({ text: 'DELETE FROM artist' });
}

export const deleteScrobblesAndTimestamp = async function () {
  await executeQuery({ text: 'DELETE FROM scrobbles' });
  await executeQuery({ text: 'DELETE FROM sync_timestamp' })
  await executeQuery({ text: 'UPDATE track set plays = 0' })
}

/*********************************************************************************************************************** */

const executeQuery = async (query: { text: string, values?: any[] } | string): Promise<any[] | null> => {
  const client = await pool.connect()
  try {
    const res = await client.query(query);
    return res.rows;
  } catch (err) {
    console.log(err.stack)
    return null;
  } finally {
    client.release()
  }
}

pool.on('connect', (client) => {
  client.query('SET search_path TO "mulibrary"');
});