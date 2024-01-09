import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { resolve } from 'path';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { Administrator } from 'src/entities/administrator.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator)
        private readonly administratorService: Repository<Administrator>
    ){}

    getAll():Promise<Administrator[]>{
        return this.administratorService.find()
    }

    getById(administratorId : number):Promise<Administrator>{
        return this.administratorService.findOne({where:{administratorId}});
    }

    add(data: AddAdministratorDto):Promise<Administrator | ApiResponse>{
        const crypto = require('crypto')
        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toUpperCase()

        let newAdmin = new Administrator()
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return new Promise((resolve)=>{
            this.administratorService.save(newAdmin)
            .then(data => resolve(data))
            .catch(error=>{
                let response = new ApiResponse("error", -1001)
                resolve(response)
            })
        })
    }

    async edit(administratorId: number, data:EditAdministratorDto):Promise<Administrator | ApiResponse>{
        const admin = await this.administratorService.findOne({where:{administratorId}});

        if(admin === null){
            return new Promise((resolve) =>{
                resolve(new ApiResponse("error", -1002))
            })
        }

        const crypto = require('crypto')
        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toUpperCase()

        admin.passwordHash = passwordHashString;

        return this.administratorService.save(admin);
    }
}
