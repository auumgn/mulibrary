export interface IScrobble {
  name: string;
  artist: string;
  album: string;
  timestamp?: number;
  track_id?: number;
  artist_id?: number[];
  album_id?: number;
  category?: string;
  // remove pls
  count?: number;
}

/*
{
  "folk": [{date: 2023-01-01T00.00.00Z, count: 2}, {date: 2022-01-01T00.00.00Z, count:5}],
  "classical": [{date: 2023-01-01T00.00.00Z, count: 2}, {...etc}],
}
 */
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
    public category?: string,
  // remove pls
    public count?: number
  ) {}
}


