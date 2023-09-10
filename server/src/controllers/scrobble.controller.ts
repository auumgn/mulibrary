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

  @Get('top-artists') // /scrobbles/top-artists
  getArtistScrobbles(
    @Query('range') range: number,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getTopArtists(range);
  }

  @Get('top-albums') // /scrobbles/top-albums
  getTopAlbums(
    @Query('range') range: number,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getTopAlbums(range);
  }

  @Get('album') // /scrobbles/album
  getAlbumScrobbles(
    @Query('album') album: string,
    @Query('artist') artist: string,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getAlbumScrobblesPerYear(album, artist);
  }

  @Get('top-tracks') // /scrobbles/top-tracks
  getTrackScrobbles(
    @Query('range') range: number,
  ): Promise<Scrobble[]> {
    return this.scrobbleService.getTopTracks(range);
  }

  @Get('category') // /scrobbles/category
  getCategoryScrobbles(
  ): Promise<ICategoryScrobbles> {
    return this.scrobbleService.getCategoryScrobbles();
  }
}
