export interface IScrobble {
    name: string;
    artist: string;
    album: string;
    timestamp?: number;
    track_id?: number;
    artist_id?: number[];
    album_id?: number;
    category?: string;
}
export interface ICategoryScrobbles {
    [category: string]: {
        date: Date;
        count: any;
    }[];
}
export declare class Scrobble implements IScrobble {
    name: string;
    artist: string;
    album: string;
    timestamp?: number;
    track_id?: number;
    artist_id?: number[];
    album_id?: number;
    category?: string;
    constructor(name: string, artist: string, album: string, timestamp?: number, track_id?: number, artist_id?: number[], album_id?: number, category?: string);
}
