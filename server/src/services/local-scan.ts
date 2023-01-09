import * as fs from 'fs';
import * as path from 'path';
import { parseFile } from 'music-metadata';
import { Artist } from '../models/artist.model.js';
import { Category } from '../models/category.model.js';
import { Track } from '../models/track.model.js';
import { Album } from '../models/album.model.js';
import { createAlbum, createArtist, createTrack, deleteTracksAlbumsArtists } from '../controllers/database-access.js';

const audioExtensions = ["aax", "aac", "aiff", "ape", "flac", "m4a", "mp3", "ogg", "wav", "wma"];
const BASE_MUSIC_FOLDER = 'd:\\music'
const TEMP_MUSIC_FOLDER = 'd:\\testmusik'
let category: Category;
let artist: Artist;
let album: Album;
let artistSaved = false;
let albumAlreadySaved = false;
let duplicateAlbum = false;

const scanLocalMachine = async function (dirPath: string) {
  const files = fs.readdirSync(dirPath)

  for (var i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(dirPath + "\\" + file).isDirectory()) {
      //  console.log(dirPath.replace(TEMP_MUSIC_FOLDER, ''));
      const pathArrayOld = (dirPath).replace(TEMP_MUSIC_FOLDER, '').split('\\').filter(p => p);
      const pathArray = (dirPath + '\\' + file).replace(TEMP_MUSIC_FOLDER, '').split('\\').filter(p => p);
      if (pathArray.length === 1) {
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
        album = new Album(artist, artist.id)
        albumAlreadySaved = false;
      }
      await scanLocalMachine(dirPath + "\\" + file)
    } else {
      // files
      if (audioExtensions.includes(fullPath.split(/\.(?=[^\.]+$)/)[1])) {
        /*   console.log(dirPath);
          console.log(fullPath.replace(dirPath + '\\', '')); */
        const metadata = await parseFile(fullPath);
        if (!album) album = new Album(artist, artist.id);
        if (!album?.name) album.name = metadata.common.album;
        if (!album?.genre) album.genre = metadata.common.genre;
        if (!album?.year) album.year = metadata.common.year;
        //if (!album.artwork) album.artwork = metadata.common.picture;
        console.log(metadata.common.picture);
        if (!albumAlreadySaved && !duplicateAlbum) { 
          const createAlbumResponse = await createAlbum(album);
          if (createAlbumResponse) {
            album.id = createAlbumResponse.id;
            albumAlreadySaved = true; 
            duplicateAlbum = false;
          } else {
            duplicateAlbum = true;
          }
        }

        if (!duplicateAlbum) {
          const track = new Track(
            metadata.common.title || dirPath.split(/\.(?=[^\.]+$)/)[0],
              album,
              artist,
              metadata.format.duration,
              metadata.common.track.no,
              category,
              metadata.common.year,
              metadata.common.genre,
              artist.id,
              album.id)
            album.tracks.push(track);
            await createTrack(track);
    
        }
        
      }
      // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
    }
  }

}

// await deleteTracksAlbumsArtists();
scanLocalMachine(TEMP_MUSIC_FOLDER);