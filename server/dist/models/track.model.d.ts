import { Genre } from "./genre.model";
export interface ITrack {
    name: string;
    artist: string[];
    artist_id: number[];
    album?: string;
    album_id?: number;
    duration?: number;
    track_no?: number;
    category?: string;
    year?: number;
    genre?: Genre[] | string[];
    id?: number;
    other_names?: string[];
}
export declare class Track implements ITrack {
    name: string;
    artist: string[];
    artist_id: number[];
    album?: string;
    album_id?: number;
    duration?: number;
    track_no?: number;
    category?: string;
    year?: number;
    genre?: Genre[] | string[];
    id?: number;
    other_names?: string[];
    constructor(name: string, artist: string[], artist_id: number[], album?: string, album_id?: number, duration?: number, track_no?: number, category?: string, year?: number, genre?: Genre[] | string[], id?: number, other_names?: string[]);
}
