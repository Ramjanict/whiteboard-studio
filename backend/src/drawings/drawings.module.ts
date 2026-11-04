import { Module } from '@nestjs/common';
import { DrawingsService } from './drawings.service';
import { DrawingsController, LegacyCompatController } from './drawings.controller';

@Module({
  controllers: [DrawingsController, LegacyCompatController],
  providers: [DrawingsService],
  exports: [DrawingsService],
})
export class DrawingsModule {}
