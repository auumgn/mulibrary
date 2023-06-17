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
    count: any
  }[];
}

export class Scrobble implements IScrobble {
  constructor(
    public name: string,
    public artist: string,
    public album: string,
    public timestamp?: number,
    public track_id?: number,
    public artist_id?: number[],
    public album_id?: number,
    public category?: string
  ) {}
}
