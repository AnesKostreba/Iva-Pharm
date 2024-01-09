import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfiguration } from 'config/database.configuration';
import { Administrator } from './entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';
import { AdministratorController } from './controllers/api/administrator.controller';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    port: 3306,
    host: databaseConfiguration.host,
    database: databaseConfiguration.database,
    password: databaseConfiguration.password,
    username: databaseConfiguration.username,
    entities: [Administrator]
  }),
  TypeOrmModule.forFeature([Administrator])
],
  controllers: [
    AppController,
    AdministratorController
  ],
  providers: [AdministratorService],
})
export class AppModule {}
