import { Controller, Get, Query } from '@nestjs/common';
import { ICategoryScrobbles, Scrobble } from 'src/models/scrobble.model';
import { ScrobbleService } from 'src/services/scrobble.service';

@Controller('scrobbles')
export class ScrobbleController {
  constructor(private readonly scrobbleService: ScrobbleService) {}

  @Get('recent') // /scrobbles/recent
  getRecentScrobbles(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getRecentScrobbles(page, pageSize);
  }

  @Get('artist') // /scrobbles/artist
  getArtistScrobbles(
    @Query('range') range: number,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getArtistScrobbles(range);
  }

  @Get('album') // /scrobbles/album
  getAlbumScrobbles(
    @Query('range') range: number,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getAlbumScrobbles(range);
  }

  @Get('track') // /scrobbles/track
  getTrackScrobbles(
    @Query('range') range: number,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getTrackScrobbles(range);
  }

  @Get('category') // /scrobbles/category
  getCategoryScrobbles(
  ): Promise<ICategoryScrobbles> {
    return this.scrobbleService.getCategoryScrobbles();
  }
}
