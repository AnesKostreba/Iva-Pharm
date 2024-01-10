import { Controller, Get, Param } from "@nestjs/common";
import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
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
}