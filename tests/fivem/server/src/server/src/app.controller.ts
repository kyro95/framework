import { Controller, On } from '@aurora-mp/core';

@Controller()
export class AppController {
    @On('onResourceStart')
    async onResourceStart() {
        console.log('Resource start.');
    }
}
