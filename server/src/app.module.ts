import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { TrackController } from './controllers/track.controller';
import { TrackService } from './services/track.service';
import { ScrobbleController } from './controllers/scrobble.controller';
import { ScrobbleService } from './services/scrobble.service';

@Module({
  imports: [DbModule],
  controllers: [AppController, TrackController, ScrobbleController],
  providers: [AppService, TrackService, ScrobbleService],
})
export class AppModule {}
