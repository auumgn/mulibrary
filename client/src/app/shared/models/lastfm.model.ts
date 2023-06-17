export interface IRecentTracks {
    recenttracks?: {track: ILastFMTrack[]}
    '@attr'?: {
        perPage: number,
        totalPages: number,
        page: number,
        user: string,
        total: number
      }
}

export interface ILastFMTrack {
    name: string;
    date: {uts: number};
    album: {'#text': string};
    artist: {'#text': string};
    id: string;
    '@attr': {nowplaying: boolean}
}

export interface IScrobble {
    name: string;
    artist: string;
    album: string;
    timestamp: number
}

export class Scrobble implements IScrobble {
    constructor(
        public name: string,
        public artist: string,
        public album: string,
        public timestamp: number
    ) {}
}