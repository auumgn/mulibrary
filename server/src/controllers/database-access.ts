import pg from 'pg'
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { Scrobble } from '../models/lastfm.model';
import { ITrack, Track } from '../models/track.model';
import * as config from "./config.json";
import { stringDistance } from './distance-checker';
import promptSync from "prompt-sync";
const Pool = pg.Pool;
const prompt = promptSync();

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: config.password,
})

export const createAlbum = async (album: Album): Promise<Album | null> => {
  const existingAlbums = await getAlbumByName(album.name, album.artist.name);
  if (existingAlbums.length !== 0) {
    console.error("Duplicate album", existingAlbums[0].name, existingAlbums[0].artist);
    const album = new Album(existingAlbums[0].artist, existingAlbums[0].artist_id, existingAlbums[0].name, existingAlbums[0].year, existingAlbums[0].genre, existingAlbums[0].artwork, existingAlbums[0].id);
      return album;
  } else {
    const query = {
      text: 'INSERT INTO album(name, artist, year, category, artwork, artist_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [album.name, album.artist?.name, album.year, album.artist?.category?.name, album.artwork, album.artist_id],
    }
    //console.log('');
    console.log('Creating album', album.name, album.artist?.name);
    const res: Album[] = await executeQuery(query);
    if (res && res.length > 0) {
      const album = new Album(res[0].artist, res[0].artist_id, res[0].name, res[0].year, res[0].genre, res[0].artwork, res[0].id);
      return album;
    } else {
      return null;
    }
  }
}

export const updateAlbum = async (album: Album): Promise<Album | null> => {

  const query = {
    text: 'UPDATE album set (name, artist, year, category, artwork, artist_id) = (COALESCE($1, name), COALESCE($2, artist), COALESCE($3, year), COALESCE($4, category), COALESCE($5, artwork), COALESCE($6, artist_id)) where id = $7 RETURNING *',
    values: [album.name, album.artist?.name, album.year, album.artist?.category?.name, album.artwork, album.artist_id, album.id],
  }
  console.log('');
  console.log('Updating album', album.name);
  const res: Album[] = await executeQuery(query);

  if (res && res.length > 0) {
    const album = new Album(res[0].artist, res[0].artist_id, res[0].name, res[0].year, res[0].genre, res[0].artwork, res[0].id);
    return album;
  } else {
    return null;
  }

}

const getAlbumByName = async function (album: string, artist: string, extended?: boolean) {
  const query = {
    text: 'SELECT * from album where (lower(name) = $1 or $1 ILIKE any(other_names)) and lower(artist) = $2',
    values: [album.toLowerCase(), artist.toLowerCase()],
  }
  if (extended) {
    query.text = query.text.replace(/=/g, "LIKE");
    query.values = query.values.map(value => '%' + value + '%');
  }

  const res = await executeQuery(query);
  return res;
}

export const createArtist = async (artist: Artist): Promise<Artist | null> => {
  const existingArtists = await getArtistByName(artist.name);
  if (existingArtists.length !== 0) {
    console.error("Duplicate artist", existingArtists[0].name);
    const artist = new Artist(existingArtists[0].name, existingArtists[0].category, existingArtists[0].genre, existingArtists[0].id, existingArtists[0].other_names);
    return artist;
  } else {
    const query = {
      text: 'INSERT INTO artist(name, category) VALUES($1, $2) RETURNING *',
      values: [artist.name, artist.category.name],
    }
    //console.log('');
    //console.log('Creating artist', artist.name);
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
    text: 'UPDATE artist set (name, category, genre, other_names) = (COALESCE($1, name), COALESCE($2, category), ($3, genre), array_append(other_names, COALESCE($4, ""))) where id = $5 RETURNING *',
    values: [artist.name, artist.category?.name, artist.genre, artist.other_names, artist.id],
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
  const existingTracks = await getTrackByName(track.name, track.artist?.name, track.album?.name, track.track_no);
  if (existingTracks.length !== 0) {
    //console.error("Duplicate track", existingTracks);
    return null;
  } else {
    const query = {
      text: 'INSERT INTO track(name, artist, album, track_no, category, duration, year, genre, album_id, artist_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      values: [track.name, track.artist?.name, track.album?.name, track.track_no, track.category?.name, track.duration, track.year, track.genre, track.album_id, track.artist_id],
    }
    //console.log('Creating track', track.name);
    const res: Track[] = await executeQuery(query);
    if (res && res.length > 0) {
      const track = new Track(res[0].name, res[0].album, res[0].artist, res[0].duration, res[0].track_no, res[0].category, res[0].year, res[0].genre, res[0].artist_id, res[0].album_id, res[0].id);
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

const getTrackByName = async function (name: string, artist: string, album: string, track_no?: number, extended?: boolean) {
  const query = {
    text: 'SELECT * from track where ((lower(name) = $1 or $1 ILIKE any(other_names)) and lower(artist) = $2 and lower(album) = $3) or ((lower(name) = $1 or $1 ILIKE any(other_names)) and lower(artist) = $2 and lower(album) = $3 and track_no = $4)',
    values: [name.toLowerCase(), artist.toLowerCase(), album.toLowerCase(), track_no],
  }
  if (extended) {
    query.text = query.text.replace(/=/g, "LIKE");
    query.values = query.values.map(value => '%' + value + '%');
  }

  const res = await executeQuery(query);
  return res;
}

const getEntryById = async function (type: string, id: number) {
  const res = await executeQuery(`SELECT * from ${type} where id = ${id.toString()})`);
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

export const addPlaycount = async function (scrobble: Scrobble) {
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
  const matchingAlbum = await getAlbumByName(scrobble.album, artist.name);
  if (matchingAlbum.length === 1) {
    album = matchingAlbum[0];
  } else {
    album = await findOrCreateAlbum(scrobble, artist);
    if (!album) throw new Error('Album not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
    await updateOtherNames("album", scrobble.album, album.id);
  }

  const matchingTrack = await getTrackByName(scrobble.name, artist.name, album.name);
  if (matchingTrack.length === 1) {
    track = matchingTrack[0];
  } else {
    track = await findOrCreateTrack(scrobble, artist, album);
    if (!track) throw new Error('Track not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
    await updateOtherNames("track", scrobble.name, track.id);

  }

  if (!artist || !album || !track) {
    console.log("Error")
  }

  const query = {
    text: 'UPDATE track set plays = plays + 1 where (name = $1 or name = $2) and (artist = $3 or artist = $4) and (album = $5 or album = $6)',
    values: [scrobble.name, track.name, scrobble.artist, artist.name, scrobble.album, album.name],
  }
  let formattedQuery = `${query.text}`;
  for (let i = 1; i < query.values.length; i++) {
    formattedQuery = formattedQuery.replace("$" + i.toString(), query.values[i - 1]);
  }
  console.log(formattedQuery);

  const res = await executeQuery(query);
  return res;
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

const findOrCreateAlbum = async (scrobble: Scrobble, artist: Artist): Promise<Album> => {
  const albumsInDatabase = await executeQuery({ text: "SELECT name, id from album where artist = $1 or artist = $2", values: [scrobble.artist, artist] });
  if (!albumsInDatabase) {
    // TODO: BAD? even if there's nothing, create something? or we can't have nothing? think how returning null can be positive for catching weird shit
    return null
  }
  
  console.log(`Missing album, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  console.log("Closest db names: ");
  const closestEntries: ClosestEntries = findClosestEntries(albumsInDatabase, scrobble.album);
  const album: UserRequest = await promptUserAndProcess("album", closestEntries, scrobble.album);
  if (album.newEntryName !== undefined) {
    const newAlbum = new Album(Artist, artist.id, album.newEntryName);
    album.data = await createAlbum(newAlbum);
  }
  return album.data as Album;
}

const findOrCreateTrack = async (scrobble: Scrobble, artist: Artist, album: Album): Promise<Track> => {
  const tracksInDatabase = await executeQuery({ text: "SELECT name, id from track where artist = $1 or artist = $2 and album = $3 or album = $4",
                                                values: [scrobble.artist, artist, scrobble.album, album] });
  if (!tracksInDatabase) {
    // TODO: BAD? even if there's nothing, create something? or we can't have nothing? think how returning null can be positive for catching weird shit
    return null
  }
  
  console.log(`Missing album, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  console.log("Closest db names: ");
  const closestEntries: ClosestEntries = findClosestEntries(tracksInDatabase, scrobble.name);
  const track: UserRequest = await promptUserAndProcess("track", closestEntries, scrobble.name);
  if (track.newEntryName !== undefined) {
    const newTrack = new Track(track.newEntryName, album, artist);
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
    } else if (existingEntryIndex.startsWith("create ")) {
      userPrompt.newEntryName = existingEntryIndex.slice(7);
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
    text: 'INSERT into scrobbles(name, artist, album, timestamp) VALUES($1, $2, $3, $4)',
    values: [scrobble.name, scrobble.artist, scrobble.album, scrobble.timestamp],
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
  await executeQuery({ text: 'DELETE FROM track' });
  await executeQuery({ text: 'DELETE FROM album' });
  await executeQuery({ text: 'DELETE FROM artist' });
}

export const deleteScrobblesAndTimestamp = async function () {
  await executeQuery({ text: 'DELETE FROM scrobbles' });
  await executeQuery({ text: 'DELETE FROM sync_timestamp' })
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