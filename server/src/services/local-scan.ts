import * as fs from 'fs';
import * as path from 'path';
import { parseFile } from 'music-metadata';
import { Artist } from '../models/artist.model.js';
import { Category } from '../models/category.model.js';
import { Track } from '../models/track.model.js';
import { Album } from '../models/album.model.js';
import { createAlbum, createArtist, createTrack, deleteTracksAlbumsArtists, updateAlbum } from '../controllers/database-access.js';

const audioExtensions = ["aax", "aac", "aiff", "ape", "flac", "m4a", "mp3", "ogg", "wav", "wma"];
const artworkExtensions = ["jpg", "png"];
const skipFolders = ['Friends', 'Various'];
const BASE_MUSIC_FOLDER = 'd:\\music';
const TEMP_MUSIC_FOLDER = 'd:\\testmusik';
let category: Category;
let artist: Artist;
let album: Album;
let albumUpdated = false;
let duplicateAlbum = false;

const scanLocalMachine = async function (dirPath: string) {
  const files = fs.readdirSync(dirPath)

  for (var i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(dirPath + "\\" + file).isDirectory()) {
      const pathArray = (dirPath + '\\' + file).replace(BASE_MUSIC_FOLDER, '').split('\\').filter(p => p);
      if (pathArray.length === 1) {
        if (skipFolders.includes(pathArray[0])) continue;
        category = new Category(pathArray[0]);
        artist = undefined;
        albumUpdated = false;
      }
      if (pathArray.length === 2) {
        artist = new Artist(pathArray[1], category);
        const createArtistResponse = await createArtist(artist);
        if (createArtistResponse) {
          artist.id = createArtistResponse.id;
        }
        albumUpdated = false;
        album = undefined;
      }
      if (pathArray.length === 3) {
        album = new Album(artist, artist.id, filterAlbumName(pathArray[2]))
        const createAlbumResponse = await createAlbum(album);
        if (createAlbumResponse) {
          duplicateAlbum = false;
          album.id = createAlbumResponse.id;
        } else {
          duplicateAlbum = true;
        }
      }
      await scanLocalMachine(dirPath + "\\" + file)
    } else {
      // audiofiles
      if (audioExtensions.includes(fullPath.split(/\.(?=[^\.]+$)/)[1])) {
        const metadata = await parseFile(fullPath); 
        //if (!artist) artist = new Artist()
        if (!albumUpdated && !duplicateAlbum) {
          if (!album) album = new Album(artist, artist?.id || null);
          if (!album?.genre) album.genre = metadata.common.genre;
          if (!album?.year) album.year = metadata.common.year;
          if (album && metadata.common.album) album.name = filterAlbumName(metadata.common.album);

          const updateAlbumResponse = await updateAlbum(album);
          if (updateAlbumResponse) {
            album.id = updateAlbumResponse.id;
            albumUpdated = true;
          }
        }

        if (!duplicateAlbum) {
          const pathArray = (dirPath + '\\' + file).replace(BASE_MUSIC_FOLDER, '').split('\\').filter(p => p);
          const track = new Track(
            metadata.common.title || file,
            album,
            artist,
            metadata.format.duration,
            metadata.common.track.no,
            category,
            metadata.common.year,
            metadata.common.genre,
            artist?.id || null,
            album?.id || null)
          album?.tracks.push(track);
          await createTrack(track);
        }

      } else if (artworkExtensions.includes(fullPath.split(/\.(?=[^\.]+$)/)[1])) {
        // artwork
        const pathArray = (dirPath + '\\' + file).replace(dirPath, '').split('\\').filter(p => p);
        // in case album artwork needs to be stored with a category/artist/album folder structure
        /* const dir = `./content/artwork/${pathArray[0]}/${pathArray[1]}/${pathArray[2]}`;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(dir + '\\' + file)) {
          fs.copyFileSync(dirPath + '\\' + file, dir + '\\' + file);
          if (album?.id) {
            album.artwork.push()
            await updateAlbum(album);
          }
        } */
        if (album?.id) {
          const dir = process.cwd() + `\\src\\content\\artwork\\`;
          const artworkFilename = album.id + '_' + file;
          if (!fs.existsSync(dir + artworkFilename)) {
            fs.copyFileSync(dirPath + '\\' + file, dir + artworkFilename);
            album.artwork.push(artworkFilename);
            await updateAlbum(album);
          }
        }
      }
    }
  }
}

const filterAlbumName = (name: string) : string => {
  return name.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

// await deleteTracksAlbumsArtists();
scanLocalMachine(BASE_MUSIC_FOLDER);