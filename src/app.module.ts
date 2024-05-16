import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { SuperUserService } from '@/utils';

import { AuthModule } from '@/auth/auth.module';
import { SeedModule } from '@/seed/seed.module';
import { FilesModule } from '@/files/files.module';

import { UserModule } from '@/user/user.module';
import { PastorModule } from '@/pastor/pastor.module';
import { DiscipleModule } from '@/disciple/disciple.module';
import { CopastorModule } from '@/copastor/copastor.module';
import { PreacherModule } from '@/preacher/preacher.module';
import { OfferingModule } from '@/offering/offering.module';
import { FamilyHouseModule } from '@/family-house/family-house.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl:
          process.env.STAGE === 'prod' ? { rejectUnauthorized: false } : null,
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true, // to automatically load the entities we define.
      synchronize: process.env.STAGE === 'prod' ? false : true, // automatic synchronization with DB (no production, do migrations)
    }),
    CommonModule,
    DiscipleModule,
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    OfferingModule,
    SeedModule,
    FilesModule,
    AuthModule,
    UserModule,
  ],
  providers: [SuperUserService],
})
export class AppModule {}
