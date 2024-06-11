import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { resolve } from 'path';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';
import { Administrator } from 'src/entities/administrator.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import { Repository } from 'typeorm';
import * as crypto from 'crypto'
import { AdministratorToken } from 'src/entities/administrator-token.entity';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator)
        private readonly administratorService: Repository<Administrator>,

        @InjectRepository(AdministratorToken)
        private readonly administratorToken: Repository<AdministratorToken>
    ) { }

    getAll(): Promise<Administrator[]> {
        return this.administratorService.find()
    }

    async getByUsername(usernameString: string): Promise<Administrator | null> {
        const admin = await this.administratorService.findOne({
            where: { username: usernameString }
        });

        if (admin) {
            return admin
        }
        return null;
    }

    getById(administratorId: number): Promise<Administrator> {
        return this.administratorService.findOne({ where: { administratorId } });
    }

    add(data: AddAdministratorDto): Promise<Administrator | ApiResponse> {

        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toUpperCase()

        let newAdmin = new Administrator()
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return new Promise((resolve) => {
            this.administratorService.save(newAdmin)
                .then(data => resolve(data))
                .catch(error => {
                    let response = new ApiResponse("error", -1001)
                    resolve(response)
                })
        })
    }

    async edit(administratorId: number, data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
        const admin = await this.administratorService.findOne({ where: { administratorId } });

        if (admin === null) {
            return new Promise((resolve) => {
                resolve(new ApiResponse("error", -1002))
            })
        }


        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toUpperCase()

        admin.passwordHash = passwordHashString;

        return this.administratorService.save(admin);
    }

    async addToken(administratorId: number, token: string, exiresAt: string){
        const administratorToken = new AdministratorToken();
        administratorToken.administratorId = administratorId;
        administratorToken.token = token;
        administratorToken.expiresAt = exiresAt;

        return await this.administratorToken.save(administratorToken);
    }

    async getAdministratorToken(token: string):Promise<AdministratorToken>{ // po njegovom stringu ga mozemo jedino preoznati da bismo ga izvukli
        return await this.administratorToken.findOne({
            where:{token: token}
        })
    }

    async invalidateToken(token: string):Promise<AdministratorToken | ApiResponse>{ // invalidacija tokena
        const administratorToken = await this.administratorToken.findOne({
            where:{token: token}
        });

        if(!administratorToken){
            return new ApiResponse('error', -10001, 'No such refresh token!')
        }

        administratorToken.isValid = 0;

        await this.administratorToken.save(administratorToken);

        return await this.getAdministratorToken(token);
    }

    async invalidateAdministratorTokens(administratorId: number): Promise<(AdministratorToken | ApiResponse)[]>{
        const administratorTokens = await this.administratorToken.find({
            where:{ administratorId : administratorId}
        });

        const results = [];

        for(const administratorToken of administratorTokens){
            results.push(this.invalidateToken(administratorToken.token));
        }

        return results;
    }
}
