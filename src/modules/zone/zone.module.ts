import { Module } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { ZoneController } from './zone.controller';

@Module({
  controllers: [ZoneController],
  providers: [ZoneService],
})
export class ZoneModule {}
