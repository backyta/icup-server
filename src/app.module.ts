import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from './members/members.module';
import { CommonModule } from './common/common.module';
import { PastorModule } from './pastor/pastor.module';
import { CopastorModule } from './copastor/copastor.module';
import { PreacherModule } from './preacher/preacher.module';
import { FamilyHomeModule } from './family-home/family-home.module';

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
      autoLoadEntities: true, // para cargar automaticamente las entidades que definimos.
      synchronize: true, // sincronizacion automatica con DB (no production, hacer migrations)
    }),
    CommonModule,
    MembersModule,
    PastorModule,
    CopastorModule,
    PreacherModule,
    FamilyHomeModule,
  ],
})
export class AppModule {}
