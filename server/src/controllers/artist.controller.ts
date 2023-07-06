import { Controller, Get, Query } from '@nestjs/common';
import { Artist } from 'src/models/artist.model';
import { ITreenode } from 'src/models/treenode.model';
import { ArtistService } from 'src/services/artist.service';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get('category')
  getArtistsByCategory(@Query('category') category: string): Promise<Artist[]> {
    return this.artistService.getArtistsByCategory(category);
  }

  @Get('all')
  getArtists(): Promise<ITreenode[]> {
    return this.artistService.getArtists();
  }

  @Get()
  getArtistByName(@Query('artist') artist: string): Promise<Artist[]> {
    return this.artistService.getArtistByName(artist);
  }
}
