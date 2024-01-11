import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";

@Controller('api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'article_id',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category:{
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            photos:{
                eager:true
            },
            articlePrices: {
                eager:true
            },
            features:{
                eager: true
            }
          }
    },
})
export class ArticleController {
    constructor(public service: ArticleService) { }

    @Get()
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

    @Get(':id')
    async getOne(@Param('id') id: number): Promise<Article> {
        const article = await this.service.findOne({
            where: { articleId: id,  },
            relations:['category', 'photos', 'articlePrices', 'articleFeatures']
        });

        return article;
    }

    @Post('createFull') // POST http://localhost:3000/api/article/createFull/
    createFullArticle(@Body() data: AddArticleDto){
        return this.service.createFullArticle(data);
    }
}