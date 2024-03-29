import { Album } from "./album.model";
import { Category } from "./category.model";
import { Genre } from "./genre.model";

export interface IArtist {
    name: string;
    category?: string;
    genre?: Genre[];
    id?: number;
    other_names?: string[];
    discography?: Album[];
}

export class Artist implements IArtist {
    constructor(
        public name: string,
        public category?: string,
        public genre?: Genre[],
        public id?: number,
        public other_names?: string[],
        public discography?: Album[]
    ) {}
}