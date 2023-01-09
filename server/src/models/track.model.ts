import { Album } from "./album.model";
import { Artist } from "./artist.model";
import { Category } from "./category.model";
import { Genre } from "./genre.model";

export interface ITrack {
    name: string;
    album: Album;
    artist: Artist;
    duration: number;
    track_no: number;
    category: Category;
    year?: number;
    genre?: Genre[] | string[];
    artist_id?: number;
    album_id?: number;
    id?: number;
}

export class Track implements ITrack {
    constructor(
        public name: string,
        public album: Album,
        public artist: Artist,
        public duration: number,
        public track_no: number,
        public category: Category,
        public year?: number,
        public genre?: Genre[] | string[],
        public artist_id?: number,
        public album_id?: number,
        public id?: number
        ) {}
}