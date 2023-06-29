import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { ICategoryScrobbles, Scrobble } from 'src/models/scrobble.model';

@Injectable()
export class ScrobbleService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async getInfo() {
    const res = await this.conn.query('select * from "mulibrary"."artist"');
    return res.rows;
  }

  async getRecentScrobbles(
    page: number,
    pageSize: number,
  ): Promise<Scrobble[]> {
    const offset = (page - 1) * pageSize;
    const query = {
      text: 'select * from "mulibrary"."scrobbles" order by timestamp desc limit $1 offset $2',
      values: [pageSize, offset],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getTopArtists(range: number): Promise<Scrobble[]> {
    const query = {
      text: 'select artist, count(artist) as playcount, category from "mulibrary"."scrobbles" where timestamp > $1 group by artist, category order by count(artist) desc limit 10',
      values: [range],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getTopAlbums(range: number): Promise<Scrobble[]> {
    const query = {
      text: 'select album, count(album) as playcount, artist, category from "mulibrary"."scrobbles" where timestamp > $1 group by album, artist, category order by count(album) desc limit 10',
      values: [range],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getAlbumScrobbles(id:number, range: number): Promise<Scrobble[]> {
    const query = {
      text: 'select album, count(album) as playcount, artist, category from "mulibrary"."scrobbles" where timestamp > $1 group by album, artist, category order by count(album) desc limit 10',
      values: [range],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getTopTracks(range: number): Promise<Scrobble[]> {
    const query = {
      text: 'select name, count(name) as playcount, artist, category from "mulibrary"."scrobbles" where timestamp > $1 group by name, artist, category order by count(name) desc limit 10',
      values: [range],
    };
    const res = await this.conn.query(query);
    return res.rows;
  }

  async getCategoryScrobbles2(): Promise<ICategoryScrobbles> {
    const query = {
      text: 'SELECT EXTRACT(MONTH FROM TO_TIMESTAMP(timestamp)) AS month, EXTRACT(YEAR FROM TO_TIMESTAMP(timestamp)) AS year, category, COUNT(*) AS count FROM "mulibrary"."scrobbles" WHERE category IS NOT NULL GROUP BY year, month, category ORDER BY year, month, category;',
      //text: 'SELECT EXTRACT(YEAR FROM TO_TIMESTAMP(timestamp)) AS date, category, COUNT(*) AS count FROM "mulibrary"."scrobbles" WHERE category IS NOT NULL GROUP BY date, category ORDER BY date, category;'
    };
    const res = await this.conn.query(query);

    if (res && res.rows) {
      const categories: ICategoryScrobbles = {};

      res.rows.forEach((r) => {
        if (!categories[r.category]) {
          categories[r.category] = [];
          for (let year = 2009; year <= new Date().getFullYear(); year++) {
            for (let month = 0; month <= 11; month = month + 4) {
              categories[r.category].push({
                date: new Date(Date.UTC(year, month, 1)),
                count: 0,
              });
            }
            /*  categories[r.category].push({
              date: new Date(Date.UTC(year, 0, 1)),
              count: 0,
            }) */
          }
        }

        const categoryYear = categories[r.category].find(
          (entry) =>
            entry.date.getTime() ===
            new Date(
              Date.UTC(r.year ? r.year : r.date, r.month ? r.month - 1 : 0, 1),
            ).getTime(),
        );

        if (categoryYear) categoryYear.count = r.count;
      });

      return categories;
    }
  }

  async getCategoryScrobbles(): Promise<ICategoryScrobbles> {
    const query = {
      //text: 'WITH category_counts AS ( SELECT category, EXTRACT(YEAR FROM TO_TIMESTAMP(timestamp::bigint)) AS year, COUNT(*) AS count_per_category FROM "mulibrary"."scrobbles" WHERE category IS NOT NULL GROUP BY category, year ), year_totals AS ( SELECT year, SUM(count_per_category) AS total_per_year FROM category_counts GROUP BY year ) SELECT category, year, (count_per_category / total_per_year) * 100 AS count FROM category_counts JOIN year_totals USING (year) ORDER BY year, category;',
      text: 'WITH category_counts AS ( SELECT category, EXTRACT(YEAR FROM TO_TIMESTAMP(timestamp::bigint)) AS year, EXTRACT(MONTH FROM TO_TIMESTAMP(timestamp::bigint)) AS month, COUNT(*) AS count_per_category FROM "mulibrary"."scrobbles" WHERE category IS NOT NULL GROUP BY category, year, month ), year_month_totals AS ( SELECT year, month, SUM(count_per_category) AS total_per_year_month FROM category_counts GROUP BY year, month ), filtered_data AS ( SELECT category, year, month, count_per_category, total_per_year_month FROM category_counts JOIN year_month_totals USING (year, month) WHERE (month % 6) = 1) SELECT category, year, month, (count_per_category / total_per_year_month) * 100 AS count FROM filtered_data ORDER BY year, month, category;'
    };
    const result = await this.conn.query(query);
    const categoryPercentages: ICategoryScrobbles = {};

    result.rows.forEach((r) => {
      const { category, year, count } = r;

      if (!categoryPercentages[category]) {
        categoryPercentages[category] = [];
        
        for (let year = 2009; year <= new Date().getFullYear(); year++) {
          for (let month = 0; month <= 11; month = month + 6) {
            categoryPercentages[category].push({
              date: new Date(Date.UTC(year, month, 1)),
              count: 0,
            });
          } 
          /* categoryPercentages[r.category].push({
            date: new Date(Date.UTC(year, 0, 1)),
            count: 0,
          })  */
        }
        
      }

      const categoryYear = categoryPercentages[category].find(
        (entry) =>
          entry.date.getTime() ===
          new Date(
            Date.UTC(r.year ? r.year : r.date, r.month ? r.month - 1 : 0, 1),
          ).getTime(),
      );

      if (categoryYear) categoryYear.count = r.count;
    });

    return categoryPercentages;
  }
}
