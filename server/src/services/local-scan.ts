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
let duplicateAlbum = false;

// add a new table to store the json of the music folder structure, if change is detected = scan those folders
const scanLocalMachine = async function (dirPath: string) {
  const files = fs.readdirSync(dirPath)

  for (var i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dirPath, file).toLowerCase();
    const pathArray = (dirPath + '\\' + file).replace(BASE_MUSIC_FOLDER, '').split('\\').filter(p => p);

    if (fs.statSync(dirPath + "\\" + file).isDirectory()) {
      if (pathArray.length === 1) {
        if (skipFolders.includes(pathArray[0])) continue;
        category = new Category(pathArray[0]);
        artist = undefined;
      }
      if (pathArray.length === 2) {
        artist = new Artist(pathArray[1], category);
        const createArtistResponse = await createArtist(artist);
        if (createArtistResponse) {
          artist.id = createArtistResponse.id;
        }
        album = undefined;
      }
      if (pathArray.length === 3) {
        album = undefined;
      }
      await scanLocalMachine(dirPath + "\\" + file)
    } else {
      // audiofiles
      if (audioExtensions.includes(fullPath.split(/\.(?=[^\.]+$)/)[1])) {
        const metadata = await parseFile(fullPath); 
        //if (!artist) artist = new Artist()

        // create album using track metadata
        if (!album) {
          album = new Album(artist, artist?.id || null, filterAlbumName(metadata.common.album) || filterAlbumName(pathArray[2]))
          album.genre = metadata.common.genre;
          album.year = metadata.common.year;
          
          const createAlbumResponse = await createAlbum(album);
          if (createAlbumResponse) {
            duplicateAlbum = false;
            album.id = createAlbumResponse.id;
            album.artwork = createAlbumResponse.artwork;
          } else {
            duplicateAlbum = true;
          }
        }

        // remove this check?
        if (!duplicateAlbum) {
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

const filterAlbumName = (name: string) : string | null => {
  if (name) {
    return name.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  } else {
    return null;
  }
}

//await deleteTracksAlbumsArtists();
scanLocalMachine(BASE_MUSIC_FOLDER);