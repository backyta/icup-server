import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';

import { ExternalDonor } from '@/modules/external-donor/entities/external-donor.entity';
import { ExternalDonorService } from '@/modules/external-donor/external-donor.service';
import { ExternalDonorController } from '@/modules/external-donor/external-donor.controller';

@Module({
  controllers: [ExternalDonorController],
  providers: [ExternalDonorService],
  imports: [TypeOrmModule.forFeature([ExternalDonor]), AuthModule],
  exports: [TypeOrmModule, ExternalDonorService],
})
export class ExternalDonorModule {}
