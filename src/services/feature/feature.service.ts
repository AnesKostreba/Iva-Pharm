import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { FeatureDto } from "src/dtos/feature/feature.dto";
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";

@Injectable()
export class FeatureService extends TypeOrmCrudService<Feature>{
    constructor(
        @InjectRepository(Feature)
        private readonly feature: Repository<Feature>
    ) {
        super(feature)
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