import { ArticleFeatureComponentDto } from "./article.feature.component.dto";
import * as Validator from 'class-validator';
export class EditArticleDto {
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5, 128)
    name: string;

    categoryId: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 255)
    excerpt: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(64, 10000)
    description: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.IsIn(["available", "visible", "hidden"])
    status: 'available' | 'visible' | 'hidden';

    @Validator.IsNotEmpty()
    @Validator.IsIn([0, 1])
    isPromoted: 0 | 1;
    
    price: number;

    @Validator.IsOptional()
    @Validator.IsArray()
    @Validator.ValidateNested({
        always: true,
    })
    features: ArticleFeatureComponentDto[] | null;
}