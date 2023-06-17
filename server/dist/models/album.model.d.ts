import { Genre } from "./genre.model";
export interface IAlbum {
    name: string;
    artist?: string[];
    artist_id?: number[];
    year?: number;
    genre?: Genre[] | string[];
    artwork?: string[];
    tracks?: number[];
    id?: number;
    other_names?: string[];
    category?: string;
}
export declare class Album implements IAlbum {
    name: string;
    artist?: string[];
    artist_id?: number[];
    year?: number;
    genre?: Genre[] | string[];
    artwork?: string[];
    id?: number;
    tracks?: number[];
    other_names?: string[];
    category?: string;
    constructor(name: string, artist?: string[], artist_id?: number[], year?: number, genre?: Genre[] | string[], artwork?: string[], id?: number, tracks?: number[], other_names?: string[], category?: string);
}
