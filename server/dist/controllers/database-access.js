"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScrobblesAndTimestamp = exports.deleteTracksAlbumsArtists = exports.getRecentTimestamp = exports.insertSyncTimestamp = exports.rollbackScrobbleImport = exports.getLatestScrobbleTimestamp = exports.insertScrobble = exports.addPlaycount = exports.createTrack = exports.updateArtist = exports.createArtist = exports.updateArtwork = exports.createAlbum = void 0;
const pg_1 = require("pg");
const album_model_1 = require("../models/album.model");
const artist_model_1 = require("../models/artist.model");
const track_model_1 = require("../models/track.model");
const config = require("../db/config.json");
const distance_checker_1 = require("./distance-checker");
const prompt_sync_1 = require("prompt-sync");
const Pool = pg_1.default.Pool;
const prompt = (0, prompt_sync_1.default)();
const debug = true;
const pool = new Pool({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: config.password,
});
const createAlbum = async (album) => {
    const existingAlbums = await getAlbumByName(album.name, album.artist);
    if (existingAlbums && existingAlbums.length !== 0) {
        console.error("Duplicate album", existingAlbums[0].name, existingAlbums[0].artist);
        const album = new album_model_1.Album(existingAlbums[0].artist, existingAlbums[0].artist_id, existingAlbums[0].name, existingAlbums[0].year, existingAlbums[0].genre, existingAlbums[0].artwork, existingAlbums[0].id);
        return album;
    }
    else {
        const query = {
            text: 'INSERT INTO album(name, artist, year, category, artwork, artist_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
            values: [album.name, album.artist, album.year, album.category, album.artwork, album.artist_id],
        };
        console.log('Creating album', album.name, album.artist);
        let res = await executeQuery(query);
        if (res && res.length > 0) {
            album.id = res[0].id;
            const newQuery = {
                text: 'INSERT INTO "albumArtist"(artist, artist_id, album, album_id) VALUES($1, $2, $3, $4) RETURNING *',
                values: [album.artist[0], album.artist_id[0], album.name, album.id]
            };
            await executeQuery(newQuery);
            return album;
        }
        else {
            return null;
        }
    }
};
exports.createAlbum = createAlbum;
const updateArtwork = async (album) => {
    const query = {
        text: `UPDATE album set artwork = array_append(artwork, $1) where ID = $2 RETURNING *`,
        values: [album.artwork, album.id],
    };
    console.log('');
    console.log('Updating artwork', album.name, album.artist);
    const res = await executeQuery(query);
    if (res && res.length > 0) {
        const album = new album_model_1.Album(res[0].name, res[0].artist, res[0].artist_id, res[0].year, res[0].genre, res[0].artwork, res[0].id, res[0].tracks, res[0].other_names, res[0].category);
        return album;
    }
    else {
        return null;
    }
};
exports.updateArtwork = updateArtwork;
const getAlbumByName = async function (album, artist) {
    let query = {
        text: `SELECT al.* from album al inner join "albumArtist" aa on al.id = aa.album_id
    INNER JOIN artist ar on ar.id = aa.artist_id 
    WHERE (lower(al.name) = $1 or $1 ILIKE any(al.other_names)) 
    AND ($2::text[] && (ar.other_names) OR lower(ar.name) = any($2::text[]))`,
        values: [album.toLowerCase(), artist.map(a => a.toLowerCase())],
    };
    if (debug)
        console.log("getalbum by name", query);
    const res = await executeQuery(query);
    return res;
};
const createArtist = async (artist) => {
    const existingArtists = await getArtistByName(artist.name);
    if (existingArtists && existingArtists.length !== 0) {
        console.error("Duplicate artist", existingArtists[0].name);
        const artist = new artist_model_1.Artist(existingArtists[0].name, existingArtists[0].category, existingArtists[0].genre, existingArtists[0].id, existingArtists[0].other_names);
        return artist;
    }
    else {
        const query = {
            text: 'INSERT INTO artist(name, category) VALUES($1, $2) RETURNING *',
            values: [artist.name, artist.category],
        };
        console.log('');
        console.log('Creating artist', artist.name);
        const res = await executeQuery(query);
        if (res && res.length > 0) {
            const artist = new artist_model_1.Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_names);
            return artist;
        }
        else {
            return null;
        }
    }
};
exports.createArtist = createArtist;
const updateArtist = async (artist) => {
    const query = {
        text: 'UPDATE artist set (name, category, genre, other_names) = (COALESCE($1, name), COALESCE($2, category), ($3, genre), array_append(other_names, $4)) where id = $5 RETURNING *',
        values: [artist.name, artist.category, artist.genre, artist.other_names, artist.id],
    };
    const res = await executeQuery(query);
    if (res && res.length > 0) {
        const artist = new artist_model_1.Artist(res[0].name, res[0].category, res[0].genre, res[0].id, res[0].other_names);
        return artist;
    }
    else {
        return null;
    }
};
exports.updateArtist = updateArtist;
const getArtistByName = async function (name, extended) {
    const query = {
        text: 'SELECT * from artist where lower(name) = $1 or $1 ILIKE any(other_names)',
        values: [name.toLowerCase()],
    };
    if (extended) {
        query.text = query.text.replace(/=/g, "LIKE");
        query.values = query.values.map(value => '%' + value + '%');
    }
    const res = await executeQuery(query);
    return res;
};
const createTrack = async (track) => {
    const existingTracks = await getTrackByName(track.name, track.artist, track.album_id, track.track_no);
    if (existingTracks && existingTracks.length !== 0) {
        return null;
    }
    else {
        const query = {
            text: 'INSERT INTO track(name, artist, album, track_no, category, duration, year, genre, album_id, artist_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            values: [track.name, track.artist, track.album, track.track_no, track.category, track.duration, track.year, track.genre, track.album_id, track.artist_id],
        };
        const res = await executeQuery(query);
        if (res && res.length > 0) {
            track.id = res[0].id;
            track.other_names = res[0].other_names;
            const newQuery = {
                text: 'INSERT INTO "trackArtist"(artist, artist_id, track, track_id) VALUES($1, $2, $3, $4) RETURNING *',
                values: [track.artist[0], track.artist_id[0], track.name, track.id]
            };
            await executeQuery(newQuery);
            return track;
        }
        else {
            return null;
        }
    }
};
exports.createTrack = createTrack;
const getTrackByName = async function (name, artist, album_id, track_no) {
    let query = {
        text: `SELECT t.* from track t INNER JOIN "trackArtist" ta ON t.id = ta.track_id
    INNER JOIN artist a ON ta.artist_id = a.id
    WHERE (lower(t.name) = $1 or $1 ILIKE any(t.other_names))
    AND (($3::integer IS NULL AND ($2 && a.other_names OR lower(a.name) ILIKE ANY($2))) or t.album_id = $3::integer)
    AND (t.track_no = $4 OR $4 IS NULL)`,
        values: [name.toLowerCase(), artist.map(a => a.toLowerCase()), album_id, track_no],
    };
    if (debug)
        console.log("get track by name", query);
    const res = await executeQuery(query);
    console.log("what", res);
    return res;
};
const getEntryById = async function (type, id) {
    const res = await executeQuery(`SELECT * from ${type} where id = ${id.toString()}`);
    return res;
};
const updateOtherNames = async (type, newOtherName, id) => {
    const query = {
        text: `UPDATE ${type} set other_names = array_append(other_names, $1) where id = $2 RETURNING *`,
        values: [newOtherName, id],
    };
    const res = await executeQuery(query);
    return res;
};
const addPlaycount = async function (scrobble) {
    let artist;
    let album;
    let track;
    const matchingArtist = await getArtistByName(scrobble.artist);
    if (matchingArtist.length === 1) {
        artist = matchingArtist[0];
    }
    else {
        artist = await findOrCreateArtist(scrobble);
        if (!artist)
            throw new Error('Artist not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
        await updateOtherNames("artist", scrobble.artist, artist.id);
    }
    const matchingAlbum = await getAlbumByName(scrobble.album, [artist.name]);
    if (matchingAlbum.length === 1) {
        album = matchingAlbum[0];
    }
    else {
        album = await findOrCreateAlbum(scrobble, artist);
        if (!album)
            throw new Error('Album not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
        await updateOtherNames("album", scrobble.album, album.id);
    }
    const matchingTrack = await getTrackByName(scrobble.name, [artist.name], album.id || null);
    console.log(matchingTrack);
    if (matchingTrack.length === 1) {
        track = matchingTrack[0];
    }
    else {
        track = await findOrCreateTrack(scrobble, artist, album);
        if (!track)
            throw new Error('Track not found in database or unable to create one:\n' + scrobble.artist + ' - ' + scrobble.album + ' - ' + scrobble.name);
        await updateOtherNames("track", scrobble.name, track.id);
    }
    const query = {
        text: 'UPDATE track set plays = plays + 1 where id = $1 RETURNING *',
        values: [track.id],
    };
    const res = await executeQuery(query);
    if (res && res.length > 0) {
        return res[0];
    }
    else {
        return null;
    }
};
exports.addPlaycount = addPlaycount;
const findOrCreateArtist = async (scrobble) => {
    const artistsInDatabase = await executeQuery({ text: 'SELECT name, id from artist' });
    if (!artistsInDatabase) {
        return null;
    }
    console.log(`Missing artist, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
    console.log("Closest db names: ");
    const closestEntries = findClosestEntries(artistsInDatabase, scrobble.artist);
    const artist = await promptUserAndProcess("artist", closestEntries, scrobble.artist);
    if (artist.newEntryName !== undefined) {
        const newArtist = new artist_model_1.Artist(artist.newEntryName);
        artist.data = await (0, exports.createArtist)(newArtist);
    }
    return artist.data;
};
const findOrCreateAlbum = async (scrobble, artist) => {
    const query = { text: "SELECT name, id from album where $1 = any(artist_id)", values: [artist.id] };
    if (debug)
        console.log("findOrCreateAlbum", query);
    const albumsInDatabase = await executeQuery(query);
    if (!albumsInDatabase) {
        return null;
    }
    console.log(`Missing album, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
    console.log("Closest db names: ");
    const closestEntries = findClosestEntries(albumsInDatabase, scrobble.album);
    const album = await promptUserAndProcess("album", closestEntries, scrobble.album);
    if (album.newEntryName !== undefined) {
        const newAlbum = new album_model_1.Album(album.newEntryName, [artist.name], [artist.id], null, artist.genre, null, null, null, null, artist.category);
        album.data = await (0, exports.createAlbum)(newAlbum);
    }
    return album.data;
};
const findOrCreateTrack = async (scrobble, artist, album) => {
    const query = {
        text: "SELECT name, id from track where album_id = $1",
        values: [album.id]
    };
    if (debug)
        console.log("findOrCreateTrack", query);
    const tracksInDatabase = await executeQuery(query);
    console.log(tracksInDatabase);
    if (!tracksInDatabase) {
        return null;
    }
    console.log(`Missing track, scrobble info: `, scrobble.artist, ",", scrobble.album, ",", scrobble.name);
    console.log("Closest db names: ");
    const closestEntries = findClosestEntries(tracksInDatabase, scrobble.name);
    if (closestEntries && closestEntries['0']) { }
    const track = await promptUserAndProcess("track", closestEntries, scrobble.name);
    if (track.newEntryName !== undefined) {
        const newTrack = new track_model_1.Track(track.newEntryName, [artist.name], [artist.id], album.name, album.id, null, null, artist.category, album.year, album.genre);
        track.data = await (0, exports.createTrack)(newTrack);
    }
    return track.data;
};
const promptUserAndProcess = async (type, closestEntries, scrobbleName) => {
    let validId = false;
    const userPrompt = {};
    if (closestEntries && closestEntries['0']) {
        const res = await getEntryById(type, closestEntries['0'][0].id);
        if (res && res.length > 0) {
            userPrompt.data = res[0];
            return userPrompt;
        }
    }
    while (!validId) {
        let existingEntryIndex = prompt(`Please choose ${type} id from the array above: `);
        if (!isNaN(existingEntryIndex)) {
            const match = Object.values(closestEntries).flat().find((entry) => entry.id === +existingEntryIndex);
            if (match && match.id) {
                validId = true;
                userPrompt.data = match;
                return userPrompt;
            }
        }
        else if (existingEntryIndex.startsWith("id")) {
            const res = await getEntryById(type, existingEntryIndex.slice(2));
            if (res && res.length > 0) {
                validId = true;
                userPrompt.data = res[0];
                return userPrompt;
            }
            else {
                console.log("Invalid id provided");
            }
        }
        else if (existingEntryIndex === "create") {
            userPrompt.newEntryName = scrobbleName;
            return userPrompt;
        }
        else if (existingEntryIndex === "skip") {
            return undefined;
        }
        else if (existingEntryIndex === "quit") {
            process.exit();
        }
    }
};
const findClosestEntries = (databaseEntries, entryName) => {
    let distance;
    const closestEntries = {};
    for (let i = 0; i < databaseEntries.length; i++) {
        distance = (0, distance_checker_1.stringDistance)(databaseEntries[i].name.toLowerCase(), entryName.toLowerCase());
        if (!closestEntries[distance]) {
            closestEntries[distance] = [];
        }
        closestEntries[distance].push(databaseEntries[i]);
    }
    const sortedEntries = Object.keys(closestEntries).map(Number).sort((a, b) => (a - b));
    let sortedEntriesLimit = 0;
    for (let i = 0; i < sortedEntries.length; i++) {
        if (sortedEntriesLimit === 3)
            break;
        console.log(sortedEntries[i], closestEntries[sortedEntries[i]]);
        sortedEntriesLimit++;
    }
    return closestEntries;
};
const insertScrobble = async (scrobble) => {
    const query = {
        text: 'INSERT into scrobbles(name, artist, album, timestamp, track_id, artist_id, album_id, category) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
        values: [scrobble.name, scrobble.artist, scrobble.album, scrobble.timestamp, scrobble.track_id, scrobble.artist_id, scrobble.album_id, scrobble.category],
    };
    const res = await executeQuery(query);
    return res;
};
exports.insertScrobble = insertScrobble;
const getLatestScrobbleTimestamp = async () => {
    const query = {
        text: 'select timestamp from scrobbles order by timestamp desc limit 1',
    };
    const res = await executeQuery(query);
    return res;
};
exports.getLatestScrobbleTimestamp = getLatestScrobbleTimestamp;
const rollbackScrobbleImport = async (timestamp, scrobbleTimestamp) => {
    let query = {
        text: 'remove from sync_timestamp where timestamp > $1',
        values: [timestamp],
    };
    const res = await executeQuery(query);
    query = {
        text: 'remove from scrobbles where timestamp > $1',
        values: [scrobbleTimestamp],
    };
    const res2 = await executeQuery(query);
    return [res, res2];
};
exports.rollbackScrobbleImport = rollbackScrobbleImport;
const insertSyncTimestamp = async (timestamp) => {
    const query = {
        text: 'INSERT into sync_timestamp(timestamp) VALUES($1)',
        values: [timestamp],
    };
    const res = await executeQuery(query);
    return res;
};
exports.insertSyncTimestamp = insertSyncTimestamp;
const getRecentTimestamp = async () => {
    const query = {
        text: 'select timestamp from sync_timestamp order by timestamp desc limit 1',
    };
    const res = await executeQuery(query);
    return res;
};
exports.getRecentTimestamp = getRecentTimestamp;
const deleteTracksAlbumsArtists = async function () {
    await executeQuery({ text: 'DELETE FROM "trackArtist"' });
    await executeQuery({ text: 'DELETE FROM "albumArtist"' });
    await executeQuery({ text: 'DELETE FROM track' });
    await executeQuery({ text: 'DELETE FROM album' });
    await executeQuery({ text: 'DELETE FROM artist' });
};
exports.deleteTracksAlbumsArtists = deleteTracksAlbumsArtists;
const deleteScrobblesAndTimestamp = async function () {
    await executeQuery({ text: 'DELETE FROM scrobbles' });
    await executeQuery({ text: 'DELETE FROM sync_timestamp' });
    await executeQuery({ text: 'UPDATE track set plays = 0' });
};
exports.deleteScrobblesAndTimestamp = deleteScrobblesAndTimestamp;
const executeQuery = async (query) => {
    const client = await pool.connect();
    try {
        const res = await client.query(query);
        return res.rows;
    }
    catch (err) {
        console.log(err.stack);
        return null;
    }
    finally {
        client.release();
    }
};
pool.on('connect', (client) => {
    client.query('SET search_path TO "mulibrary"');
});
//# sourceMappingURL=database-access.js.map