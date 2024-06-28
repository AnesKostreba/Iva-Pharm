import { IsNotEmpty, IsString } from "class-validator";

export class ArticleSearchByName {
    @IsString()
    @IsNotEmpty()
    keywords: string;
}