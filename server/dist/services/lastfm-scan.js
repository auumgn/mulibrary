"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracks = exports.getSession = exports.getToken = void 0;
const node_fetch_1 = require("node-fetch");
const config = require("../db/config.json");
const database_access_1 = require("../controllers/database-access");
const scrobble_model_1 = require("../models/scrobble.model");
const getToken = async () => {
    return await (0, node_fetch_1.default)(`https://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=${config.lastfm_api_key}&format=json`)
        .then((response) => response.json())
        .then((json) => {
        return json;
    })
        .catch((err) => console.error(err));
};
exports.getToken = getToken;
const getSession = async () => {
    (0, node_fetch_1.default)(`https://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI`)
        .then((response) => response.json())
        .then((json) => {
        console.log(json);
    })
        .catch((err) => console.error(err));
};
exports.getSession = getSession;
const getTracks = async () => {
    let timestamp = 0;
    let scrobbleTimestamp = 0;
    const tsRes = await (0, database_access_1.getRecentTimestamp)();
    console.log(tsRes);
    const tsScrobbleRes = await (0, database_access_1.getLatestScrobbleTimestamp)();
    if (tsRes.length > 0) {
        timestamp = tsRes[0].timestamp / 1000;
    }
    if (tsScrobbleRes.length > 0) {
        scrobbleTimestamp = tsScrobbleRes[0].timestamp / 1000;
    }
    console.log(timestamp, scrobbleTimestamp);
    try {
        await (0, database_access_1.insertSyncTimestamp)(Date.now());
        let page = 1;
        let lastPage = 2;
        let nowPlaying = '';
        while (page <= lastPage) {
            const res = await (0, node_fetch_1.default)(`https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&api_key=${config.lastfm_api_key}&token=FCnt6ZrXPKkdhNWoaM0vX9z-ddZY0HTI&user=auumgn&limit=200&format=json&page=${page}`);
            const tracks = await res.json();
            lastPage = tracks.recenttracks['@attr'].totalPages;
            for (let i = 0; i < tracks.recenttracks.track.length; i++) {
                const res = tracks.recenttracks.track[i];
                if (res['@attr'] && res['@attr'].nowplaying) {
                    if (nowPlaying !== res.id) {
                        const scrobble = new scrobble_model_1.Scrobble(res.name, res.artist['#text'], res.album['#text'], Math.ceil(Date.now() / 1000));
                        const track = await (0, database_access_1.addPlaycount)(scrobble);
                        scrobble.artist_id = track.artist_id;
                        scrobble.album_id = track.album_id;
                        scrobble.track_id = track.id;
                        scrobble.category = track.category;
                        await (0, database_access_1.insertScrobble)(scrobble);
                    }
                    nowPlaying = res.id;
                }
                else if (timestamp < +res.date.uts) {
                    const scrobble = new scrobble_model_1.Scrobble(res.name, res.artist['#text'], res.album['#text'], res.date.uts);
                    const track = await (0, database_access_1.addPlaycount)(scrobble);
                    scrobble.artist_id = track.artist_id;
                    scrobble.album_id = track.album_id;
                    scrobble.track_id = track.id;
                    scrobble.category = track.category;
                    await (0, database_access_1.insertScrobble)(scrobble);
                }
                else {
                    lastPage = 0;
                    break;
                }
            }
            console.log('page no ', page);
            page++;
        }
    }
    catch (err) {
        console.error('Rolling back, error:', err);
        const res = (0, database_access_1.rollbackScrobbleImport)(timestamp, scrobbleTimestamp);
        console.log(res);
    }
};
exports.getTracks = getTracks;
async function main() {
    (0, exports.getTracks)();
}
main();
//# sourceMappingURL=lastfm-scan.js.map