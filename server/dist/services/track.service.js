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
exports.TrackService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
let TrackService = exports.TrackService = class TrackService {
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
};
exports.TrackService = TrackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], TrackService);
//# sourceMappingURL=track.service.js.map