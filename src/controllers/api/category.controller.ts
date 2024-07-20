import { Body, ConflictException, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { CreateCategoryDto } from "src/dtos/category/add.category.dto";
import { EditCategoryDto } from "src/dtos/category/edit.category.dto";
import { Category } from "src/entities/category.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
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
                eager: false
            },
            features: {
                eager: false
            },
            parentCategory:{
                eager: false
            },
            articles:{
                eager: false
            }
        }
    },
    routes:{
        only:[
            "createOneBase",
            "createManyBase",
            "getManyBase",
            "getOneBase",
            "updateOneBase"
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
                AllowToRoles('administrator', "user", "visitor")
            ]
        },
        
        getOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user", "visitor")
            ]
        },
        updateOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user", "visitor")
            ]
        }
    }

})
export class CategoryController {
    constructor(public service: CategoryService) { }

    @Get(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator', 'user', "visitor")
    async getOne(@Param('id') id: number): Promise<Category>{
        const category = await this.service.findOne({
            where: { categoryId: id},
            relations: ['categories','parentCategory']
        })
        return category;
    }


    @Get()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator', "user", "visitor")
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

    @Post('create')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async createOne(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
        const { name } = createCategoryDto;
        const existingCategory = await this.service.findOne({where: { name }});
        if(existingCategory){
            throw new ConflictException('Category already exists!');
        }

        const category = new Category();
        category.name = createCategoryDto.name;
        category.imagePath = createCategoryDto.imagePath;
        category.parentCategoryId = createCategoryDto.parentCategoryId;
        return this.service.create(category);
    }

    @Patch(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    async updateCategory(@Param('id') id: number, @Body() editCategoryDto: EditCategoryDto): Promise<Category> {
        return this.service.updateCategory(id, editCategoryDto);
    }
}