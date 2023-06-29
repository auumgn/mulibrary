import { Controller, Get, Query } from '@nestjs/common';
import { Scrobble } from 'src/models/scrobble.model';
import { Track } from 'src/models/track.model';
import { TrackService } from 'src/services/track.service';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('album') // /track/recent
  getTracksByAlbum(
    @Query('album') album: string,
    @Query('artist') artist: string,
  ): Promise<Track[]> {
    return this.trackService.getTracksByAlbum(album, artist);
  }
}
