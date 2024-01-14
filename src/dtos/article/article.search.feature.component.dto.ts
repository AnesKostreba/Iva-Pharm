import * as Validator from 'class-validator'

export class ArticleSearcFeaturComponentDto {
    featureId: number;

    @Validator.IsArray()
    @Validator.IsNotEmpty({ each: true }) // validator pita da li je tacno da nije prazna vrednost svakog elementa stringa
    @Validator.IsString({ each: true })
    @Validator.Length(1, 255, { each: true })
    values: string[];
}