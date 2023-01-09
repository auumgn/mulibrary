import { Album } from "./album.model";
import { Category } from "./category.model";
import { Genre } from "./genre.model";

export interface IArtist {
    name: string;
    category: Category;
    discography?: Album[];
    genre?: Genre[];
    id?: number;
}

export class Artist implements IArtist {
    constructor(
        public name: string,
        public category: Category,
        public discography?: Album[],
        public genre?: Genre[],
        public id?: number
    ) {}
}