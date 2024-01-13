import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { FeatureService } from "src/services/feature/feature.service";
import { Body, Controller, Get, HttpCode, Param, Post} from '@nestjs/common';
import { FeatureDto } from "src/dtos/feature/feature.dto";
import { ApiTags } from '@nestjs/swagger';


@Crud({
    model: {
        type: Feature,
    },
    params: {
        featureId: {
            field: 'feature_id',
            type: 'number',
            primary: true
        }
    },
    query: {
        alwaysPaginate: true,
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            articles: {
                eager: false
            },
        }
    },
    routes: {
        createOneBase:{
            returnShallow: true
        },
        
        only: [
            'createOneBase',
            'createManyBase',
            'updateOneBase',
            'updateOneBase',
            'getManyBase',
            'getOneBase',
        ],
    },
})
@ApiTags('feature')
@Controller('api/feature')
export class FeatureController implements CrudController<Feature> {
    constructor(public service: FeatureService) { }
    @Get()
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

    @Get(':id')
    async getOne(@Param('id') id: number): Promise<Feature> {
        const article = await this.service.findOne({
            where: { featureId: id, },
            relations: ['category']
        });
        return article;
    }

    // @Post()
    // async createFeature(
    //   @Body('name') name: string,
    //   @Body('categoryId') categoryId: number,
    // ) {
    //   try {
    //     const newFeature = await this.service.createFeature(name, categoryId);

    //     const completeInfo = await this.service.findOne({
    //         where: { featureId: newFeature.featureId },
    //         relations: ['category']
    //       });

    //     return { success: true, feature: completeInfo };
    //   } catch (error) {
    //     return { success: false, message: error.message };
    //   }
    // }
}