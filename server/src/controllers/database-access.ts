import pg from 'pg'
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { ITrack, Track } from '../models/track.model';
import * as config from "./config.json";
const Pool = pg.Pool;

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: config.password,
})

export const createAlbum = async (album: Album) : Promise<Album | null> => {
  const existingAlbums = await getAlbumByName(album.name, album.artist.name);
  if (existingAlbums.length !== 0) {
    console.error("Duplicate album", existingAlbums);
    return null;
  } else {
    const query = {
      text: 'INSERT INTO album(name, artist, year, category, artwork, artist_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [album.name, album.artist.name, album.year, album.artist.category.name, album.artwork, album.artist_id],
    }
    console.log('');
    console.log('Creating album', album.name);
    const res : Album[] = await executeQuery(query);
    if (res && res.length > 0) {
      const album = new Album(res[0].artist, res[0].artist_id, res[0].name, res[0].year, res[0].genre, res[0].artwork, res[0].id);
      return album;
    } else {
      return null;
    }
  }
}

export const createArtist = async (artist: Artist) : Promise<Artist | null> => {
  const existingArtists = await getArtistByName(artist.name);
  if (existingArtists.length !== 0) {
    console.error("Duplicate artist", existingArtists);
    return null;
  } else {
    const query = {
      text: 'INSERT INTO artist(name, category) VALUES($1, $2) RETURNING *',
      values: [artist.name, artist.category.name],
    }
    console.log('');
    console.log('Creating artist', artist.name);
    const res: Artist[] = await executeQuery(query);
    if (res && res.length > 0) {
      const artist = new Artist(res[0].name, res[0].category, res[0].discography, res[0].genre, res[0].id);
      return artist;
    } else {
      return null;
    }
  }
}

export const createTrack = async (track: ITrack) : Promise<Track | null> => {
  const existingTracks = await getTrackByName(track.name, track.artist.name, track.album.name);
  if (existingTracks.length !== 0) {
    console.error("Duplicate track", existingTracks);
    return null;
  } else {
    const query = {
      text: 'INSERT INTO track(name, artist, album, track_no, category, duration, year, genre, album_id, artist_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      values: [track.name, track.artist.name, track.album.name, track.track_no, track.category.name, track.duration, track.year, track.genre, track.album_id, track.artist_id],
    }
    console.log('Creating track', track.name);
    const res: Track[] = await executeQuery(query);
    if (res && res.length > 0) {
      const track = new Track(res[0].name, res[0].album, res[0].artist, res[0].duration, res[0].track_no, res[0].category, res[0].year, res[0].genre, res[0].artist_id, res[0].album_id, res[0].id);
      return track;
    } else {
      return null;
    }
  }
}

export const getArtistByName = async function (name: string) {
  const query = {
    text: 'SELECT * from artist where name = $1',
    values: [name],
  }
  const res = await executeQuery(query);
  return res;
}

export const getTrackByName = async function (name: string, artist: string, album: string) {
  const query = {
    text: 'SELECT * from track where name = $1 and artist = $2 and album = $3',
    values: [name, artist, album],
  }
  const res = await executeQuery(query);
  return res;
}

export const getAlbumByName = async function (album: string, artist: string) {
  const query = {
    text: 'SELECT * from album where name = $1 and artist = $2',
    values: [album, artist],
  }
  const res = await executeQuery(query);
  return res;
}

export const deleteTracksAlbumsArtists = async function () {
  await executeQuery({text: 'DELETE FROM track'});
  await executeQuery({text: 'DELETE FROM album'});
  await executeQuery({text: 'DELETE FROM artist'});
}


const executeQuery = async (query: { text: string, values?: any[] }) : Promise<[] | null> => {
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