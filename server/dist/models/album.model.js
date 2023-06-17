"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Album = void 0;
class Album {
    constructor(name, artist, artist_id, year, genre, artwork, id, tracks, other_names, category) {
        this.name = name;
        this.artist = artist;
        this.artist_id = artist_id;
        this.year = year;
        this.genre = genre;
        this.artwork = artwork;
        this.id = id;
        this.tracks = tracks;
        this.other_names = other_names;
        this.category = category;
        this.tracks = [];
        this.artwork = [];
    }
}
exports.Album = Album;
//# sourceMappingURL=album.model.js.map