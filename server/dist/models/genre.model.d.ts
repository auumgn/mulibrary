export interface IGenre {
    id: number;
    name: string;
}
export declare class Genre implements IGenre {
    id: number;
    name: string;
    constructor(id: number, name: string);
}
