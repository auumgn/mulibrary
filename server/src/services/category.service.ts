import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { ITreenode } from 'src/models/treenode.model';

@Injectable()
export class CategoryService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}
  async getCategories(): Promise<ITreenode[]> {
    const query = {
      text: 'select name from "mulibrary"."category"',
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

}
