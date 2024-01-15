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
import { PhotoService } from './services/photo/photo.service';
import { FeatureService } from './services/feature/feature.service';
import { FeatureController } from './controllers/api/feature.controller';
import { UserService } from './services/user/user.service';
import { CartService } from './services/cart/cart.service';
import { UserCartController } from './controllers/api/user.cart.controller';
import { OrderService } from './services/order/order.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfig } from 'config/mail.config';
import { OrderMailer } from './services/order/order.mailer.service';
import { AdministratorOrderController } from './controllers/api/administrator.order.controller';
import { UserToken } from './entities/user-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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
      User,
      UserToken
    ]
  }),
  TypeOrmModule.forFeature([
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
      User,
      UserToken
  ]),
  MailerModule.forRoot({
    // smtps://username:password@smtp.gmail.com
    transport: 'smtps://' + MailConfig.username + ':' + 
                            MailConfig.password + '@' +
                            MailConfig.hostname,
    defaults:{
      from: MailConfig.senderEmail,
    }

  }),
],
  controllers: [
    AppController,
    AdministratorController,
    CategoryController,
    ArticleController,
    AuthController,
    FeatureController,
    UserCartController,
    AdministratorOrderController
  ],
  providers: [
    AdministratorService,
    CategoryService,
    ArticleService,
    PhotoService,
    FeatureService,
    UserService,
    CartService,
    OrderService,
    OrderMailer
  ],
  exports:[
    AdministratorService,
    UserService
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