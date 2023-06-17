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
exports.ScrobbleController = void 0;
const common_1 = require("@nestjs/common");
const scrobble_service_1 = require("../services/scrobble.service");
let ScrobbleController = exports.ScrobbleController = class ScrobbleController {
    constructor(scrobbleService) {
        this.scrobbleService = scrobbleService;
    }
    getRecentScrobbles(page = 1, pageSize = 10) {
        return this.scrobbleService.getRecentScrobbles(page, pageSize);
    }
    getArtistScrobbles(range) {
        return this.scrobbleService.getArtistScrobbles(range);
    }
    getAlbumScrobbles(range) {
        return this.scrobbleService.getAlbumScrobbles(range);
    }
    getTrackScrobbles(range) {
        return this.scrobbleService.getTrackScrobbles(range);
    }
    getCategoryScrobbles() {
        return this.scrobbleService.getCategoryScrobbles();
    }
};
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ScrobbleController.prototype, "getRecentScrobbles", null);
__decorate([
    (0, common_1.Get)('artist'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScrobbleController.prototype, "getArtistScrobbles", null);
__decorate([
    (0, common_1.Get)('album'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScrobbleController.prototype, "getAlbumScrobbles", null);
__decorate([
    (0, common_1.Get)('track'),
    __param(0, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScrobbleController.prototype, "getTrackScrobbles", null);
__decorate([
    (0, common_1.Get)('category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScrobbleController.prototype, "getCategoryScrobbles", null);
exports.ScrobbleController = ScrobbleController = __decorate([
    (0, common_1.Controller)('scrobbles'),
    __metadata("design:paramtypes", [scrobble_service_1.ScrobbleService])
], ScrobbleController);
//# sourceMappingURL=scrobble.controller.js.map