import { IPicture } from "music-metadata";
import { Artist } from "./artist.model";
import { Genre } from "./genre.model";
import { Track } from "./track.model";

export interface IAlbum {
    artist: Artist;
    artist_id?: number;
    name?: string;
    year?: number;
    genre?: Genre[] | string[];
    artwork?: string[];
    tracks?: Track[];
    id?: number;
    other_name?: string;
}

export class Album implements IAlbum {
    constructor(
        public artist: Artist,
        public artist_id?: number,
        public name?: string,
        public year?: number,
        public genre?: Genre[] | string[],
        public artwork?: string[],
        public id?: number,
        public tracks?: Track[],
        public other_name?: string
    ) {this.tracks = []; this.artwork = []}
}