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