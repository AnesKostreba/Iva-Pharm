import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfiguration } from 'config/database.configuration';
import { Administrator } from './entities/administrator.entity';
import { AdministratorService } from './services/administrator/administrator.service';
import { AdministratorController } from './controllers/api/administrator.controller';
import { CategoryService } from './services/category/category.service';
import { Category } from './entities/category.entity';
import { CategoryController } from './controllers/api/category.controller';
import { Article } from './entities/article.entity';
import { ArticleFeature } from './entities/article.feature.entity';
import { ArticlePrice } from './entities/article.price';
import { CartArticle } from './entities/cart.article.entity';
import { Cart } from './entities/cart.entity';
import { Feature } from './entities/feature.entity';
import { Order } from './entities/order.entity';
import { Photo } from './entities/photo.entity';
import { User } from './entities/user.entity';
import { ArticleService } from './services/article/article.service';
import { ArticleController } from './controllers/api/article.controller';
import { AuthController } from './controllers/api/auth.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    port: 3306,
    host: databaseConfiguration.host,
    database: databaseConfiguration.database,
    password: databaseConfiguration.password,
    username: databaseConfiguration.username,
    entities: [
      Administrator,
      ArticleFeature,
      Article,
      ArticlePrice,
      CartArticle,
      Cart,
      Category,
      Feature,
      Order,
      Photo,
      User
    ]
  }),
  TypeOrmModule.forFeature([
    Administrator,
    Category,
    Article,
    ArticlePrice,
    ArticleFeature
  ])
],
  controllers: [
    AppController,
    AdministratorController,
    CategoryController,
    ArticleController,
    AuthController
  ],
  providers: [
    AdministratorService,
    CategoryService,
    ArticleService,
  ],
  exports:[
    AdministratorService,
  ]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(AuthMiddleware)
    .exclude('auth/*') // iskljuci
    .forRoutes('api/*') // ukljuci
  }
}
