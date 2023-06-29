import { Controller, Get, Query } from '@nestjs/common';
import { Artist } from 'src/models/artist.model';
import { Category } from 'src/models/category.model';
import { ArtistService } from 'src/services/artist.service';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get('category')
  getArtistsByCategory(@Query('category') category: string): Promise<Artist[]> {
    return this.artistService.getArtistsByCategory(category);
  }

  @Get('all')
  getArtists(): Promise<Artist[]> {
    return this.artistService.getArtists();
  }
}
