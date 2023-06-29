import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Category } from 'src/models/category.model';

@Injectable()
export class CategoryService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}
  async getCategories(): Promise<Category[]> {
    const query = {
      text: 'select * from "mulibrary"."category"',
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

}
