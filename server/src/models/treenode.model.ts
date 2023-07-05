export interface ITreenode {
    category: string,
    artist?: string,
    album?: {artist: string[], name: string}
}

export class Treenode {
    constructor(public category: string, public artist?: string, public album?: {artist: string[], name: string}) {}
}