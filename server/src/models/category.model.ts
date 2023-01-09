export interface ICategory {
    name: string;
    id?: number;
}

export class Category implements ICategory {
    constructor(public name: string, public id?: number) { }
}