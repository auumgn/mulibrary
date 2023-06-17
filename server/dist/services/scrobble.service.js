"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrobbleService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
let ScrobbleService = exports.ScrobbleService = class ScrobbleService {
    constructor(conn) {
        this.conn = conn;
    }
    async getInfo() {
        const res = await this.conn.query('select * from "mulibrary"."artist"');
        return res.rows;
    }
    async getRecentScrobbles(page, pageSize) {
        const offset = (page - 1) * pageSize;
        const query = {
            text: 'select * from "mulibrary"."scrobbles" order by timestamp desc limit $1 offset $2',
            values: [pageSize, offset],
        };
        const res = await this.conn.query(query);
        return res.rows;
    }
    async getArtistScrobbles(range) {
        const query = {
            text: 'select artist, count(artist) from "mulibrary"."scrobbles" where timestamp > $1 group by artist order by count(artist) desc limit 10',
            values: [range],
        };
        const res = await this.conn.query(query);
        return res.rows;
    }
    async getAlbumScrobbles(range) {
        const query = {
            text: 'select album, count(album), artist from "mulibrary"."scrobbles" where timestamp > $1 group by album, artist order by count(album) desc limit 10',
            values: [range],
        };
        const res = await this.conn.query(query);
        return res.rows;
    }
    async getTrackScrobbles(range) {
        const query = {
            text: 'select name, count(name), artist from "mulibrary"."scrobbles" where timestamp > $1 group by name, artist order by count(name) desc limit 10',
            values: [range],
        };
        const res = await this.conn.query(query);
        return res.rows;
    }
    async getCategoryScrobbles2() {
        const query = {
            text: 'SELECT EXTRACT(MONTH FROM TO_TIMESTAMP(timestamp)) AS month, EXTRACT(YEAR FROM TO_TIMESTAMP(timestamp)) AS year, category, COUNT(*) AS count FROM "mulibrary"."scrobbles" WHERE category IS NOT NULL GROUP BY year, month, category ORDER BY year, month, category;',
        };
        const res = await this.conn.query(query);
        if (res && res.rows) {
            const categories = {};
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
                    }
                }
                const categoryYear = categories[r.category].find((entry) => entry.date.getTime() ===
                    new Date(Date.UTC(r.year ? r.year : r.date, r.month ? r.month - 1 : 0, 1)).getTime());
                if (categoryYear)
                    categoryYear.count = r.count;
            });
            return categories;
        }
    }
    async getCategoryScrobbles() {
        const query = {
            text: 'WITH category_counts AS ( SELECT category, EXTRACT(YEAR FROM TO_TIMESTAMP(timestamp::bigint)) AS year, EXTRACT(MONTH FROM TO_TIMESTAMP(timestamp::bigint)) AS month, COUNT(*) AS count_per_category FROM "mulibrary"."scrobbles" WHERE category IS NOT NULL GROUP BY category, year, month ), year_month_totals AS ( SELECT year, month, SUM(count_per_category) AS total_per_year_month FROM category_counts GROUP BY year, month ), filtered_data AS ( SELECT category, year, month, count_per_category, total_per_year_month FROM category_counts JOIN year_month_totals USING (year, month) WHERE (month % 6) = 1) SELECT category, year, month, (count_per_category / total_per_year_month) * 100 AS count FROM filtered_data ORDER BY year, month, category;'
        };
        const result = await this.conn.query(query);
        const categoryPercentages = {};
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
                }
            }
            const categoryYear = categoryPercentages[category].find((entry) => entry.date.getTime() ===
                new Date(Date.UTC(r.year ? r.year : r.date, r.month ? r.month - 1 : 0, 1)).getTime());
            if (categoryYear)
                categoryYear.count = r.count;
        });
        return categoryPercentages;
    }
};
exports.ScrobbleService = ScrobbleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], ScrobbleService);
//# sourceMappingURL=scrobble.service.js.map