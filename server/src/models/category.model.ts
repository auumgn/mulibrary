export interface ICategory {
    name: string;
    id?: number;
    color?: string;
}

export class Category implements ICategory {
    constructor(public name: string, public id?: number, public color?: string) { }
}