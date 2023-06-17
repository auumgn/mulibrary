import { Album } from "./album.model";
import { Genre } from "./genre.model";
export interface IArtist {
    name: string;
    category?: string;
    genre?: Genre[];
    id?: number;
    other_names?: string[];
    discography?: Album[];
}
export declare class Artist implements IArtist {
    name: string;
    category?: string;
    genre?: Genre[];
    id?: number;
    other_names?: string[];
    discography?: Album[];
    constructor(name: string, category?: string, genre?: Genre[], id?: number, other_names?: string[], discography?: Album[]);
}
