import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Scrobble } from 'src/models/scrobble.model';

@Injectable()
export class TrackService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async getInfo() {
    const res = await this.conn.query('select * from "mulibrary"."artist"');
    return res.rows;
  }

  async getRecentScrobbles(page: number, pageSize: number): Promise<Scrobble[]> {
    const offset = (page - 1) * pageSize;
    const query = {
      text: 'select * from "mulibrary"."scrobbles" order by timestamp desc limit $1 offset $2',
      values: [pageSize, offset],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }
}
