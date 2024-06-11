import { IsNumber, IsString } from "class-validator";

export class EditCategoryDto {
    @IsString()
    name: string;
    @IsString()
    imagePath: string;
    @IsNumber()
    parentCategoryId: number;
}