import { Controller, Get, UseGuards } from "@nestjs/common";
import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { Category } from "src/entities/category.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
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
                AllowToRoles('administrator', "user")
            ]
        },
        
        getOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user")
            ]
        },
        updateOneBase:{
            decorators:[
                UseGuards(RoleCheckerGuard),
                AllowToRoles('administrator', "user")
            ]
        }
    }

})
export class CategoryController {
    constructor(public service: CategoryService) { }

    @Get()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }
}