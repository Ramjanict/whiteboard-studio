import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DrawingsModule } from './drawings/drawings.module';
import { HealthModule } from './health/health.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CloudinaryModule,
    DrawingsModule,
    HealthModule,
    CollaborationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
