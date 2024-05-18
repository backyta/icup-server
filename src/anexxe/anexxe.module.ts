import { Module } from '@nestjs/common';
import { AnexxeService } from './anexxe.service';
import { AnexxeController } from './anexxe.controller';

@Module({
  controllers: [AnexxeController],
  providers: [AnexxeService],
})
export class AnexxeModule {}
