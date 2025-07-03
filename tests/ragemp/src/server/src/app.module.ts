import { Module } from '@aurora-mp/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [],
    providers: [AppService],
    controllers: [AppController],
    exports: [AppService],
})
export class AppModule {}
