import { ICategoryScrobbles, Scrobble } from 'src/models/scrobble.model';
import { ScrobbleService } from 'src/services/scrobble.service';
export declare class ScrobbleController {
    private readonly scrobbleService;
    constructor(scrobbleService: ScrobbleService);
    getRecentScrobbles(page?: number, pageSize?: number): Promise<Scrobble[]>;
    getArtistScrobbles(range: number): Promise<Scrobble[]>;
    getAlbumScrobbles(range: number): Promise<Scrobble[]>;
    getTrackScrobbles(range: number): Promise<Scrobble[]>;
    getCategoryScrobbles(): Promise<ICategoryScrobbles>;
}
