"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const music_metadata_1 = require("music-metadata");
const artist_model_js_1 = require("../models/artist.model.js");
const category_model_js_1 = require("../models/category.model.js");
const track_model_js_1 = require("../models/track.model.js");
const album_model_js_1 = require("../models/album.model.js");
const database_access_js_1 = require("../controllers/database-access.js");
const audioExtensions = ["aax", "aac", "aiff", "ape", "flac", "m4a", "mp3", "ogg", "wav", "wma"];
const artworkExtensions = ["jpg", "png"];
const skipFolders = ['Friends', 'Various'];
const BASE_MUSIC_FOLDER = 'd:\\music';
const TEMP_MUSIC_FOLDER = 'd:\\testmusik';
let category;
let artist;
let album;
let duplicateAlbum = false;
const scanLocalMachine = async function (dirPath) {
    const files = fs.readdirSync(dirPath);
    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        const fullPath = path.join(dirPath, file).toLowerCase();
        const pathArray = (dirPath + '\\' + file).replace(BASE_MUSIC_FOLDER, '').split('\\').filter(p => p);
        if (fs.statSync(dirPath + "\\" + file).isDirectory()) {
            if (pathArray.length === 1) {
                if (skipFolders.includes(pathArray[0]))
                    continue;
                category = new category_model_js_1.Category(pathArray[0]);
                artist = undefined;
            }
            if (pathArray.length === 2) {
                artist = new artist_model_js_1.Artist(pathArray[1], category.name);
                const createArtistResponse = await (0, database_access_js_1.createArtist)(artist);
                if (createArtistResponse) {
                    artist.id = createArtistResponse.id;
                }
                album = undefined;
            }
            if (pathArray.length === 3) {
                album = undefined;
            }
            await scanLocalMachine(dirPath + "\\" + file);
        }
        else {
            if (audioExtensions.includes(fullPath.split(/\.(?=[^\.]+$)/)[1])) {
                const metadata = await (0, music_metadata_1.parseFile)(fullPath);
                if (!album) {
                    album = new album_model_js_1.Album(filterAlbumName(metadata.common.album) || filterAlbumName(pathArray[2]), [artist?.name] || null, [artist?.id] || null, metadata.common.year, metadata.common.genre, null, null, null, null, category.name);
                    album.genre = metadata.common.genre;
                    album.year = metadata.common.year;
                    const createAlbumResponse = await (0, database_access_js_1.createAlbum)(album);
                    if (createAlbumResponse) {
                        duplicateAlbum = false;
                        album.id = createAlbumResponse.id;
                        album.artwork = createAlbumResponse.artwork;
                    }
                    else {
                        duplicateAlbum = true;
                    }
                }
                if (!duplicateAlbum) {
                    const track = new track_model_js_1.Track(metadata.common.title || file, [artist.name], [artist.id], album.name, album.id, metadata.format.duration, metadata.common.track.no, category.name, metadata.common.year, metadata.common.genre);
                    album?.tracks.push(track.id);
                    await (0, database_access_js_1.createTrack)(track);
                }
            }
            else if (artworkExtensions.includes(fullPath.split(/\.(?=[^\.]+$)/)[1])) {
                const pathArray = (dirPath + '\\' + file).replace(dirPath, '').split('\\').filter(p => p);
                if (album?.id) {
                    const dir = process.cwd() + `\\src\\content\\artwork\\`;
                    const artworkFilename = album.id + '_' + file;
                    if (!album.artwork.find(art => art === artworkFilename)) {
                        if (!fs.existsSync(dir + artworkFilename)) {
                            fs.copyFileSync(dirPath + '\\' + file, dir + artworkFilename);
                            album.artwork.push(artworkFilename);
                            await (0, database_access_js_1.updateArtwork)(album);
                        }
                    }
                }
            }
        }
    }
};
const filterAlbumName = (name) => {
    if (name) {
        return name.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
    }
    else {
        return null;
    }
};
scanLocalMachine(BASE_MUSIC_FOLDER);
//# sourceMappingURL=local-scan.js.map