import { Controller, Get } from "@nestjs/common";
import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { CategoryService } from "src/services/category/category.service";

@Controller('api/category')
@Crud({
    model: {
        type: Category
    },
    params: {
        categoryId: {
            field: 'categoryId',
            type: 'number',
            primary: true
        }
    },
    query:{
        join:{
            categories:{
                eager: true
            },
            features: {
                eager: true
            },
            parentCategory:{
                eager: false
            },
            articles:{
                eager: false
            }
        }
    }
})
export class CategoryController {
    constructor(public service: CategoryService) { }

    @Get()
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

}