import { Controller, Inject, On } from '@aurora-mp/core';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(@Inject(AppService) private readonly appService: AppService) {}

    @On('playerReady')
    public onPlayerReady(): void {
        this.appService.onPlayerReady();
    }
}
