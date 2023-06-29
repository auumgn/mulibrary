import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Album } from 'src/models/album.model';

@Injectable()
export class AlbumService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}
  async getAlbumsByArtistName(artist: string): Promise<Album[]> {
    const query = {
      text: `select * from "mulibrary"."album" where $1 = replace(lower(array_to_string(artist, '-')), ' ', '-');`,
      values: [artist],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getAlbumByName(album: string, artist: string): Promise<Album> {
    const query = {
      //text: `select * from "mulibrary"."album" where $1 = replace(lower(array_to_string(artist, '-')), ' ', '-') and $2 = replace(lower(name), ' ', '-');`,
      text: `SELECT * FROM "mulibrary"."album" where $1 = "mulibrary"."normalize_name"(name) and $2 = "mulibrary".normalize_name(array_to_string(artist, '-'));`,
      values: [album, artist],
    };
    const res = await this.conn.query(query);
    
    return res.rows;
  }
}
