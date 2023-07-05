import { Controller, Get, Query } from '@nestjs/common';
import { Album } from 'src/models/album.model';
import { ITreenode } from 'src/models/treenode.model';
import { AlbumService } from 'src/services/album.service';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get('artist')
  getAlbumsByArtistName(
    @Query('artistName') artist: string,
  ): Promise<Album[]> {
    return this.albumService.getAlbumsByArtistName(artist);
  }

  @Get('name')
  getAlbumByName(
    @Query('album') album: string,
    @Query('artist') artist: string
  ): Promise<Album> {
    return this.albumService.getAlbumByName(album, artist);
  }
  
  @Get('all')
  getAlbums(): Promise<ITreenode[]> {
    return this.albumService.getAlbums();
  }
}
