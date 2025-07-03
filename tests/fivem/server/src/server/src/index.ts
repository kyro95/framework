import 'reflect-metadata';
import { createFiveMApplication } from '@aurora-mp/platform-fivem-server';
import { AppModule } from './app.module';

const bootstrap = async () => {
    const app = await createFiveMApplication(AppModule);
    await app.start();
};

bootstrap();
