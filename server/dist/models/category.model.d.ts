export interface ICategory {
    name: string;
    id?: number;
}
export declare class Category implements ICategory {
    name: string;
    id?: number;
    constructor(name: string, id?: number);
}
