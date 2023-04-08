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

export const addPlaycount = async function (scrobble: Scrobble) {
  // names found in the database
  let artistName: string;
  let albumName: string;
  let trackName: string;

  // find exact name
  const matchingArtist = await getArtistByName(scrobble.artist);
  // if there's 0 results or more than 1, get closest match (no more than 3 char difference)
  if (matchingArtist.length !== 1) {
    artistName = await findClosestMatch(scrobble, "artist");
    if (artistName === undefined) {
      return null;
    }
    if (!artistName) {
      // if there's still nothing, then perform a 'LIKE' query
      artistName = await extendedSearch(scrobble, "artist")
    }
  } else {
    artistName = matchingArtist[0].name;
  }

  const matchingAlbum = await getAlbumByName(scrobble.album, artistName || scrobble.artist);
  if (matchingAlbum.length !== 1) {
    albumName = await findClosestMatch(scrobble, "album", artistName || scrobble.artist);
    if (!albumName) {
      albumName = await extendedSearch(scrobble, "album", artistName || scrobble.artist);
    }
  } else {
    albumName = matchingAlbum[0].name;
  }

  const matchingTrack = await getTrackByName(scrobble.name, artistName || scrobble.artist, albumName || scrobble.album);
  if (matchingTrack.length !== 1) {
    trackName = await findClosestMatch(scrobble, "track", artistName || scrobble.artist, albumName || scrobble.album);
    if (!trackName) {
      trackName = await extendedSearch(scrobble, "track", artistName || scrobble.artist, albumName || scrobble.album);
    }
  } else {
    trackName = matchingTrack[0].name;
  }
  const query = {
    text: 'UPDATE track set plays = plays + 1 where (name = $1 or name = $2) and (artist = $3 or artist = $4) and (album = $5 or album = $6)',
    values: [scrobble.name, trackName, scrobble.artist, artistName, scrobble.album, albumName],
  }
  let formattedQuery = `${query.text}`;
  for (let i = 1; i < query.values.length; i++) {
    formattedQuery = formattedQuery.replace("$" + i.toString(), query.values[i - 1]);
  }
  console.log(formattedQuery);

  const res = await executeQuery(query);
  return res;
}

const extendedSearch = async (scrobble: Scrobble, type: string, artist?: string, album?: string): Promise<string> => {
  let localResults = [];
  let name: string;
  if (type === "artist") {
    name = scrobble.artist;
    localResults = await getArtistByName(artist || scrobble.artist, true);
  } else if (type === "album") {
    name = scrobble.album;
    localResults = await getAlbumByName(album || scrobble.album, artist || scrobble.artist, true);
  } else if (type === "track") {
    name = scrobble.name;
    localResults = await getTrackByName(scrobble.name, artist || scrobble.artist, album || scrobble.album, undefined, true);
  }
  if (!localResults) {
    return null
  }
  console.log(`Missing ${type}, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  localResults = localResults.map(entry => { return { name: entry.name, id: entry.id, artist: entry.artist || null, album: entry.album || null } })
  console.log("Available db names: ", localResults);
  let validId = false;
  while (!validId) {
    let artistIndex = prompt(`Please choose ${type} id from the array above: `);
    // if value is a number then proceed
    if (!isNaN(artistIndex)) {
      const matchingName = localResults.find((entry: Artist | Album | Track) => entry.id = +artistIndex);
      if (matchingName) {
        validId = true;
        const query = {
          text: `UPDATE ${type} set other_names = array_append(other_names, $1) where id = $2`,
          values: [name, matchingName.id],
        }
        const res = await executeQuery(query);
        return matchingName.name;
      }
    } else {
      break;
    }
  }
  return null;
}

const findClosestMatch = async (scrobble: Scrobble, type: string, artist?: string, album?: string): Promise<string> => {
  let localResults: Artist[] | Album[] | Track[];
  let name: string;
  if (type === "artist") {
    localResults = await executeQuery({ text: 'SELECT name, id from artist' });
    name = scrobble.artist;
  } else if (type === "album") {
    localResults = await executeQuery({ text: "SELECT name, id from album where artist = $1 or artist = $2", values: [scrobble.artist, artist] })
    name = scrobble.album;
  } else if (type === "track") {
    localResults = await executeQuery({ text: "SELECT name, id from track where artist = $1 or artist = $2 and album = $3 or album = $4", values: [scrobble.artist, artist, scrobble.album, album] })
    name = scrobble.name;
  }
  if (!localResults) {
    return null
  }
  let distance: number;
  let similarlyNamedEntries = {};
  for (let i = 0; i < localResults.length; i++) {
    distance = stringDistance(localResults[i].name.toLowerCase(), name.toLowerCase());
    if (!similarlyNamedEntries[distance]) {
      similarlyNamedEntries[distance] = [];
    }
    similarlyNamedEntries[distance].push({ name: localResults[i].name, id: localResults[i].id })
  }

  const sortedEntries = Object.keys(similarlyNamedEntries).map(Number).sort((a, b) => (a - b));
  console.log(`Missing ${type}, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
  console.log("Closest db names: ");
  let cnt = 0;
  for (let i = 0; i < sortedEntries.length; i++) {
    if (cnt === 3) break;
    console.log(sortedEntries[i], similarlyNamedEntries[sortedEntries[i]]);
    cnt++;
  }

  let validId = false;

  while (!validId) {
    let artistIndex = prompt(`Please choose ${type} id from the array above: `);
    // if value is a number then proceed
    if (!isNaN(artistIndex)) {
      
      const match: { name?: string, id?: number } = Object.values(similarlyNamedEntries).flat().find((entry: { name?: string, id?: number }) => entry.id === +artistIndex);
      if (match && match.id) {
        validId = true;
        const query = {
          text: `UPDATE ${type} set other_names = array_append(other_names, $1) where id = $2`,
          values: [name, match.id],
        }
        const res = await executeQuery(query);
        return match.name;
      }
    } else if (artistIndex.startsWith("id")) {
      validId = true;
        const query = {
          text: `UPDATE ${type} set other_names = array_append(other_names, $1) where id = $2`,
          values: [name, artistIndex.slice(2)],
        }
        const res = await executeQuery(query);
        if (res && res.length > 0) {
          return res[0].name;
        }
    } else if (artistIndex === "skip") {
      return undefined;
    } else if (artistIndex === "quit") {
      process.exit();
    } else {
      break;
    }
  }
  return null;
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

const executeQuery = async (query: { text: string, values?: any[] }): Promise<any[] | null> => {
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