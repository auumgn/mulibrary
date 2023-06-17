import { ICategoryScrobbles, Scrobble } from 'src/models/scrobble.model';
export declare class ScrobbleService {
    private conn;
    constructor(conn: any);
    getInfo(): Promise<any>;
    getRecentScrobbles(page: number, pageSize: number): Promise<Scrobble[]>;
    getArtistScrobbles(range: number): Promise<Scrobble[]>;
    getAlbumScrobbles(range: number): Promise<Scrobble[]>;
    getTrackScrobbles(range: number): Promise<Scrobble[]>;
    getCategoryScrobbles2(): Promise<ICategoryScrobbles>;
    getCategoryScrobbles(): Promise<ICategoryScrobbles>;
}
