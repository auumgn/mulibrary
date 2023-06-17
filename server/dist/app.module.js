"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const db_module_1 = require("./db/db.module");
const track_controller_1 = require("./controllers/track.controller");
const track_service_1 = require("./services/track.service");
const scrobble_controller_1 = require("./controllers/scrobble.controller");
const scrobble_service_1 = require("./services/scrobble.service");
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DbModule],
        controllers: [app_controller_1.AppController, track_controller_1.TrackController, scrobble_controller_1.ScrobbleController],
        providers: [app_service_1.AppService, track_service_1.TrackService, scrobble_service_1.ScrobbleService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map