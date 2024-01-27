import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MembersModule } from './members/members.module';
import { CommonModule } from './common/common.module';
import { PastorModule } from './pastor/pastor.module';
import { CopastorModule } from './copastor/copastor.module';
import { PreacherModule } from './preacher/preacher.module';
import { FamilyHomeModule } from './family-home/family-home.module';
import { OfferingModule } from './offering/offering.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
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
    FamilyHomeModule,
    OfferingModule,
    SeedModule,
    FilesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
