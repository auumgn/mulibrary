"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrobble = void 0;
class Scrobble {
    constructor(name, artist, album, timestamp, track_id, artist_id, album_id, category) {
        this.name = name;
        this.artist = artist;
        this.album = album;
        this.timestamp = timestamp;
        this.track_id = track_id;
        this.artist_id = artist_id;
        this.album_id = album_id;
        this.category = category;
    }
}
exports.Scrobble = Scrobble;
//# sourceMappingURL=scrobble.model.js.map