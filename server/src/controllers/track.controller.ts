import { Controller, Get, Query } from '@nestjs/common';
import { Scrobble } from 'src/models/scrobble.model';
import { TrackService } from 'src/services/track.service';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('recent') // /track/recent
  getRecentScrobbles(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<Scrobble[]> {
    return this.trackService.getRecentScrobbles(page, pageSize);
  }
}
