import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Scrobble } from 'src/models/scrobble.model';
import { Track } from 'src/models/track.model';

@Injectable()
export class TrackService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async getTracksByAlbum(album: string, artist: string): Promise<Track[]> {
    const query = {
      text: `select * from "mulibrary"."track" where $1 = "mulibrary"."normalize_name"(album) and $2 = "mulibrary"."normalize_name"(array_to_string(artist, '-')) order by track_no asc`,
      values: [album, artist],
    };
    
    const res = await this.conn.query(query);
    return res.rows;
  }
}
