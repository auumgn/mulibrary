import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Artist } from 'src/models/artist.model';
import { ITreenode } from 'src/models/treenode.model';

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

  async getArtists(): Promise<ITreenode[]> {
    const query = {
      text: 'select name as artist, category from "mulibrary"."artist" where category is not null',
    };
    const res = await this.conn.query(query);
    console.log(res);
    
    return res.rows;
  }
}
