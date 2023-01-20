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
    return null;
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
  //console.log('');
  //console.log('Updating album', album.name);
  const res: Album[] = await executeQuery(query);
  if (res && res.length > 0) {
    const album = new Album(res[0].artist, res[0].artist_id, res[0].name, res[0].year, res[0].genre, res[0].artwork, res[0].id);
    return album;
  } else {
    return null;
  }

}

const getAlbumByName = async function (album: string, artist: string) {
  const query = {
    text: 'SELECT * from album where (name = $1 or other_name = $1) and artist = $2',
    values: [album, artist],
  }
  const res = await executeQuery(query);
  return res;
}

export const createArtist = async (artist: Artist): Promise<Artist | null> => {
  const existingArtists = await getArtistByName(artist.name);
  if (existingArtists.length !== 0) {
    console.error("Duplicate artist", existingArtists[0].name);
    return null;
  } else {
    const query = {
      text: 'INSERT INTO artist(name, category) VALUES($1, $2) RETURNING *',
      values: [artist.name, artist.category.name],
    }
    //console.log('');
    //console.log('Creating artist', artist.name);
    const res: Artist[] = await executeQuery(query);
    if (res && res.length > 0) {
      const artist = new Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_name);
      return artist;
    } else {
      return null;
    }
  }
}

export const updateArtist = async (artist: Artist): Promise<Artist | null> => {

  const query = {
    text: 'UPDATE artist set (name, category, genre, other_name) = (COALESCE($1, name), COALESCE($2, category), ($3, genre), COALESCE($4, other_name)) where id = $5 RETURNING *',
    values: [artist.name, artist.category?.name, artist.genre, artist.other_name, artist.id],
  }
  //console.log('');
  //console.log('Updating artist', artist.name);
  const res: Artist[] = await executeQuery(query);
  if (res && res.length > 0) {
    const artist = new Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_name);
    return artist;
  } else {
    return null;
  }

}

const getArtistByName = async function (name: string) {
  const query = {
    text: 'SELECT * from artist where name = $1 or other_name = $1',
    values: [name],
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
    text: 'UPDATE track set (pla, category, genre, other_name) = (COALESCE($1, name), COALESCE($2, category), ($3, genre), COALESCE($4, other_name)) where id = $5 RETURNING *',
    values: [artist.name, artist.category?.name, artist.genre, artist.other_name, artist.id],
  }
  //console.log('');
  //console.log('Updating artist', artist.name);
  const res: Track[] = await executeQuery(query);
  if (res && res.length > 0) {
    const track = new Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_name);
    return track;
  } else {
    return null;
  }
  
}
*/

const getTrackByName = async function (name: string, artist: string, album: string, track_no: number) {
  const query = {
    text: 'SELECT * from track where name = $1 and artist = $2 and album = $3 and track_no = $4',
    values: [name, artist, album, track_no],
  }
  const res = await executeQuery(query);
  return res;
}

export const addPlaycount = async function (scrobble: Scrobble) {
  let artistName: string;
  let albumName: string;
  let trackName: string;
  const artist = await getArtistByName(scrobble.artist);
  if (artist.length === 0) {

  }
  const album = await getAlbumByName(scrobble.album, scrobble.artist);
  if (album.length === 0) {

  }
  const query = {
    text: 'UPDATE track set (plays, other_name) = (plays + 1, $1) where name = $4 and artist = $2 and album = $3',
    values: [scrobble.name, scrobble.artist, scrobble.album, artistName],
  }
  const res = await executeQuery(query);
  return res;
}

const findClosestMatch = async (scrobble: Scrobble, type: string, artist?: string, album?: string) => {
  let results: Artist[] | Album[] | Track[];
  let name: string;
  if (type === "artist") {
    results = await executeQuery({ text: 'SELECT name, id from artist' });
    name = scrobble.artist;
  } else if (type === "album") {
    results = await executeQuery({ text: "SELECT name, id from album where artist = $1 or artist = $2", values: [scrobble.artist, artist] })
    name = scrobble.album;
  } else if (type === "track") {
    results = await executeQuery({ text: "SELECT name, id from track where artist = $1 or artist = $2 and album = $3 or album = $4", values: [scrobble.artist, artist, scrobble.album, album] })
    name = scrobble.name;
  }
  let distance: number;
  let similarlyNamedEntries = {};
  for (let i = 0; i < results.length; i++) {
    distance = stringDistance(results[i].name.toLowerCase(), name.toLowerCase());
    if (distance < 4) {
      if (!similarlyNamedEntries[distance]) {
        similarlyNamedEntries[distance] = [];
      }
      similarlyNamedEntries[distance].push(results[i].name)
    }
  }
  const sortedEntries = Object.keys(similarlyNamedEntries).sort();
  if (+sortedEntries[0] < 4) {
    console.log(`Scrobble ${type} name: `, name);
    console.log("Available db names: ", similarlyNamedEntries[sortedEntries[0]]);
    const artistIndex = prompt(`Please choose ${type} name index from the array above: `);
    const matchingName = similarlyNamedEntries[sortedEntries[0]][artistIndex];
    const query = {
      text: 'UPDATE artist set other_name = $1 where name = $4',
      values: [scrobble.name, matchingName],
    }
    const res = await executeQuery(query);
    return res;
  }
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