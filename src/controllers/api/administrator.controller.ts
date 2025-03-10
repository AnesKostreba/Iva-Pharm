import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards} from "@nestjs/common";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { Administrator } from "src/entities/administrator.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { ApiResponse } from "src/misc/api.response.class";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/administrator')
export class AdministratorController{
    constructor(private administratorService: AdministratorService){}

    @Get()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    getAllAdmin():Promise<Administrator[]>{
        return this.administratorService.getAll()
    }

    @Get(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    getById(@Param('id') id: number):Promise<Administrator>{
        return this.administratorService.getById(id);
    }

    @Post()
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    addAdmin(@Body() data: AddAdministratorDto):Promise<Administrator | ApiResponse>{
        return this.administratorService.add(data)
    }

    @Patch(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('administrator')
    editAdmin(@Param('id') id: number, @Body() data: EditAdministratorDto): Promise<Administrator | ApiResponse>{
        return this.administratorService.edit(id,data);
    }
}