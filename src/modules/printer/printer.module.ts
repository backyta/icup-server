import { Module } from '@nestjs/common';
import { PrinterService } from '@/modules/printer/printer.service';

@Module({
  providers: [PrinterService],
  exports: [PrinterService],
})
export class PrinterModule {}
