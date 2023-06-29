import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Artist } from 'src/models/artist.model';

@Injectable()
export class ArtistService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}
  async getArtistsByCategory(category: string): Promise<Artist[]> {
    const query = {
      text: 'select * from "mulibrary"."artist" where category = $1',
      values: [category],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getArtists(): Promise<Artist[]> {
    const query = {
      text: 'select * from "mulibrary"."artist"',
    };
    const res = await this.conn.query(query);
    return res.rows;
  }
}
