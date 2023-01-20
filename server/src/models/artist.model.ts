import { Album } from "./album.model";
import { Category } from "./category.model";
import { Genre } from "./genre.model";

export interface IArtist {
    name: string;
    category?: Category;
    genre?: Genre[];
    id?: number;
    other_name?: string;
    discography?: Album[];
}

export class Artist implements IArtist {
    constructor(
        public name: string,
        public category?: Category,
        public genre?: Genre[],
        public id?: number,
        public other_name?: string,
        public discography?: Album[]
    ) {}
}