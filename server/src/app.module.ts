import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { TrackController } from './controllers/track.controller';
import { TrackService } from './services/track.service';
import { ScrobbleController } from './controllers/scrobble.controller';
import { ScrobbleService } from './services/scrobble.service';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';
import { AlbumService } from './services/album.service';
import { ArtistService } from './services/artist.service';
import { AlbumController } from './controllers/album.controller';
import { ArtistController } from './controllers/artist.controller';

@Module({
  imports: [DbModule],
  controllers: [
    AppController,
    TrackController,
    ScrobbleController,
    CategoryController,
    AlbumController,
    ArtistController,
  ],
  providers: [
    AppService,
    TrackService,
    ScrobbleService,
    CategoryService,
    AlbumService,
    ArtistService,
  ],
})
export class AppModule {}
