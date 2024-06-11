import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditFeatureDto {
    @IsOptional()
    @IsNumber()
    featureId: number;
    @IsString()
    name: string;
}