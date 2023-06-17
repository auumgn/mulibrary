import { Scrobble } from 'src/models/scrobble.model';
export declare class TrackService {
    private conn;
    constructor(conn: any);
    getInfo(): Promise<any>;
    getRecentScrobbles(page: number, pageSize: number): Promise<Scrobble[]>;
}
