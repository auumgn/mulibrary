import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import * as config from "./config.json";
import { PG_CONNECTION } from 'src/constants';

const dbProvider = {
    provide: PG_CONNECTION,
    useValue: new Pool({
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: config.password,
    })
}

@Module({ providers: [dbProvider], exports: [dbProvider] })
export class DbModule { }
