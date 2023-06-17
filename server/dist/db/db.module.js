"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbModule = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const config = require("./config.json");
const constants_1 = require("../constants");
const dbProvider = {
    provide: constants_1.PG_CONNECTION,
    useValue: new pg_1.Pool({
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: config.password,
    })
};
let DbModule = exports.DbModule = class DbModule {
};
exports.DbModule = DbModule = __decorate([
    (0, common_1.Module)({ providers: [dbProvider], exports: [dbProvider] })
], DbModule);
//# sourceMappingURL=db.module.js.map