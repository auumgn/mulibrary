import { Scrobble } from 'src/models/scrobble.model';
import { TrackService } from 'src/services/track.service';
export declare class TrackController {
    private readonly trackService;
    constructor(trackService: TrackService);
    getRecentScrobbles(page?: number, pageSize?: number): Promise<Scrobble[]>;
}
