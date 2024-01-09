import { Body, Controller, Get, Param, Patch, Put } from "@nestjs/common";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { Administrator } from "src/entities/administrator.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/administrator')
export class AdministratorController{
    constructor(private administratorService: AdministratorService){}

    @Get()
    getAllAdmin():Promise<Administrator[]>{
        return this.administratorService.getAll()
    }

    @Get(':id')
    getById(@Param('id') id: number):Promise<Administrator>{
        return this.administratorService.getById(id);
    }

    @Put()
    addAdmin(@Body() data: AddAdministratorDto):Promise<Administrator | ApiResponse>{
        return this.administratorService.add(data)
    }

    @Patch(':id')
    editAdmin(@Param('id') id: number, @Body() data: EditAdministratorDto): Promise<Administrator | ApiResponse>{
        return this.administratorService.edit(id,data);
    }
}