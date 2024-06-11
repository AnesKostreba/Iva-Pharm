import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Feature } from "src/entities/feature.entity";
import { FeatureService } from "src/services/feature/feature.service";
import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { FeatureDto } from "src/dtos/feature/feature.dto";
import { EditFeatureDto } from "src/dtos/feature/edit.feature.dto";


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
        only: [
            'createOneBase',
            'createManyBase',
            'updateOneBase',
            'getManyBase',
            'getOneBase',
        ],
        createOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator')
            ]
        },
        createManyBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator')
            ]
        },
        getManyBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user")
            ]
        },
        getOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user")
            ]
        },
        updateOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user")
            ]
        }
    },
})
@ApiTags('feature')
@Controller('api/feature')
export class FeatureController implements CrudController<Feature> {
    constructor(public service: FeatureService) { }
    @Get()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

    @Get(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async getOne(@Param('id') id: number): Promise<Feature> {
        const article = await this.service.findOne({
            where: { featureId: id, },
            relations: ['category']
        });
        return article;
    }

    @Get('values/:categoryId')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator', 'user')
    async getDistinctValuesByCategoryId(@Param('categoryId') categoryId: number): Promise<DistinctFeatureValuesDto>{
        return await this.service.getDistinctValuesByCategoryId(categoryId);
    }

    @Post()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async createFeature(@Body() featureDto: FeatureDto): Promise<Feature> {
        const feature = new Feature();
        feature.name = featureDto.name;
        feature.categoryId = featureDto.categoryId;

        return this.service.create(feature);
    }


    @Patch(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator') 
    async updateFeature(@Param('id') id: number, @Body() editFeatureDto: EditFeatureDto):Promise<Feature>{
        return this.service.updateFeature(id, editFeatureDto);
    }

    // @Patch(':id')
    // @UseGuards(RoleCheckerGuard)
    // @AllowToRoles('administrator')
    // async updateFeature(@Param('id') id: number, @Body() editFeature: EditFeatureDto):Promise<Feature>{
    //     return this.service.updateFeature(id, editFeature)
    // }

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