import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { SuperUserService } from '@/utils';

import { AuthModule } from '@/modules/auth/auth.module';
import { SeedModule } from '@/modules/seed/seed.module';
import { FilesModule } from '@/modules/files/files.module';

import { UserModule } from '@/modules/user/user.module';
import { PastorModule } from '@/modules/pastor/pastor.module';
import { DiscipleModule } from '@/modules/disciple/disciple.module';
import { CopastorModule } from '@/modules/copastor/copastor.module';
import { PreacherModule } from '@/modules/preacher/preacher.module';
import { OfferingModule } from '@/modules/offering/offering.module';
import { FamilyHouseModule } from '@/modules/family-house/family-house.module';
import { SupervisorModule } from '@/modules/supervisor/supervisor.module';
import { ZoneModule } from './zone/zone.module';
import { AnexxeModule } from './anexxe/anexxe.module';

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
    SupervisorModule,
    ZoneModule,
    AnexxeModule,
  ],
  providers: [SuperUserService],
})
export class AppModule {}
