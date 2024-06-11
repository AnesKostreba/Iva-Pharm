import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CrudRequest } from "@nestjsx/crud";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { EditCategoryDto } from "src/dtos/category/edit.category.dto";
import { Category } from "src/entities/category.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category>{
    constructor(
        @InjectRepository(Category)
        private readonly category: Repository<Category>
    ){
        super(category)
    }

    async create(category: Category): Promise<Category>{
        return this.category.save(category);
    }

    async updateCategory(id: number, editCategoryDto: EditCategoryDto): Promise<Category> {
        const category = await this.category.findOne({where: {categoryId: id}});
        if (!category) {
            throw new Error('Category not found');
        }

        category.name = editCategoryDto.name;
        category.imagePath = editCategoryDto.imagePath;
        category.parentCategoryId = editCategoryDto.parentCategoryId;

        return this.category.save(category);
    }
    

}