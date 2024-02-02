import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MembersModule } from './members/members.module';
import { CommonModule } from './common/common.module';
import { PastorModule } from './pastors/pastors.module';
import { CopastorModule } from './copastors/copastors.module';
import { PreacherModule } from './preachers/preachers.module';
import { FamilyHouseModule } from './family-houses/family-houses.module';
import { OfferingModule } from './offerings/offerings.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

import { SuperUserService } from './utils/create-super-user';

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
      synchronize: true, // automatic synchronization with DB (no production, do migrations)
    }),
    CommonModule,
    MembersModule,
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHouseModule,
    OfferingModule,
    SeedModule,
    FilesModule,
    AuthModule,
    UsersModule,
  ],
  providers: [SuperUserService],
})
export class AppModule {}
