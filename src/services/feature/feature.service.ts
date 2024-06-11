import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { EditCategoryDto } from "src/dtos/category/edit.category.dto";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { EditFeatureDto } from "src/dtos/feature/edit.feature.dto";
import { FeatureDto } from "src/dtos/feature/feature.dto";
import { ArticleFeature } from "src/entities/article.feature.entity";
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature>{
    constructor(
        @InjectRepository(Feature)
        private readonly feature: Repository<Feature>,
        @InjectRepository(ArticleFeature)
        private readonly articleFeature: Repository<ArticleFeature>
    ) {
        super(feature)
    }

    async getDistinctValuesByCategoryId(categoryId: number): Promise<DistinctFeatureValuesDto>{
        const features = await this.feature.find(
            {where:{categoryId:categoryId}}
        );

        const result: DistinctFeatureValuesDto = {
            features: [],
        };

        if(!features || features.length === 0){
            return result;
        }

        result.features = await Promise.all(features.map(async feature =>{
            const values: string[] = 
                        (
                            await this.articleFeature.createQueryBuilder('af')
                            .select("DISTINCT af.value", 'value')
                            .where('af.featureId = :featureId', {featureId: feature.featureId})
                            .orderBy('af.value', 'ASC')
                            .getRawMany()
                        ).map(item => item.value);

            return {
                featureId: feature.featureId,
                name: feature.name,
                values: values,
            }
        }))

        return result;
    }


    async create(feature: Feature):Promise<Feature>{
        return this.feature.save(feature)
    }


    // async updateFeature(id: number, editFeatureDto: EditFeatureDto):Promise<Feature>{
    //     const feature = await this.feature.findOne({where: {featureId: id}})

    //     feature.name = editFeatureDto.name;

    //     return this.feature.save(feature);
    // }




    async updateFeature(id: number, editFeatureDto: EditFeatureDto ):Promise<Feature>{
        const feature = await this.feature.findOne({where: { featureId: id }})

        feature.name = editFeatureDto.name;

        return this.feature.save(feature)
    }
    


    // async createFeature(name: string, categoryId: number): Promise<Feature> {
    //     // Kreiranje novog objekta Feature
    //     const newFeature = this.feature.create({
    //         name,
    //         categoryId,
    //         // Dodajte ostala svojstva ako su potrebna
    //     });

    //     // Čuvanje novog objekta u bazi podataka
    //     try {
    //         const savedFeature = await this.feature.save(newFeature);
    //         return savedFeature;
    //     } catch (error) {
    //         // Uhvati eventualne greške prilikom čuvanja u bazu
    //         console.error('Error saving feature:', error.message);
    //         throw new Error('Failed to save the feature.');
    //     }
    // }
}