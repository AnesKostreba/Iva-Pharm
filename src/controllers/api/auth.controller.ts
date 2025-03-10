import { Body, Controller, HttpException, HttpStatus, Post, Put, Req} from "@nestjs/common";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto'
import { LoginInfoDto } from "src/dtos/auth/login.info.dto";
import * as jwt from 'jsonwebtoken';
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { UserRegistrationDto } from "src/dtos/user/user.registration.dto";
import { UserService } from "src/services/user/user.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { JwtRefreshDataDto } from "src/dtos/auth/jwt.refresh.dto";
import { UserRefreshTokenDto } from "src/dtos/auth/user.refresh.token.dto";
import { AdministratorRefreshTokenDto } from "src/dtos/auth/administrator.refresh.token.dto";
import { resolve } from "path";

@Controller('auth/')
export class AuthController {
    constructor(
        public administratorService: AdministratorService,
        public userService: UserService
        ) { }

    @Post('administrator/login')// POST http://localhost:3000/auth/administrator/login
    async doAdministratorLogin(@Body() data: LoginAdministratorDto, @Req() req: Request): Promise<LoginInfoDto | ApiResponse> {
        const administrator = await this.administratorService.getByUsername(data.username);

        if (!administrator) {
            return new Promise(resolve => resolve(new ApiResponse("error", -3001))); //administrator nije pronadjen
        }

        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toUpperCase()


        if (administrator.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse("error", -3002)));// password nije ispravan
        }

        //administratorId
        //username
        //token (JWT)
        // TAJNA SIFRA
        // JSON = {administratorId, username, exp, ip, userAgent}
        // Sifrovanje (TAJNA SIFRA -> JSON) -> Sifrat binarni -> BASE64 ili HEX
        // HEX STRING

        const jwtData = new JwtDataDto();
        jwtData.role = "administrator";
        jwtData.id = administrator.administratorId;
        jwtData.identity = administrator.username;
        jwtData.exp = this.getDatePlus(60 * 5); // 5 min traje token;
        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

        let token: string =  jwt.sign(jwtData.toPlainObject(), jwtSecret); //GEN !!

        const jwtRefresData = new JwtRefreshDataDto();
        jwtRefresData.role = jwtData.role;
        jwtRefresData.id = jwtData.id;
        jwtRefresData.identity = jwtData.identity;
        jwtRefresData.exp = this.getDatePlus(60 * 60 * 24 * 31);// koliko sekundi od sada...31 dan
        jwtRefresData.ip = jwtData.ip;
        jwtRefresData.ua = jwtData.ua;

        let refreshToken: string =  jwt.sign(jwtRefresData.toPlainObject(), jwtSecret); //GEN !!

        const responseObject = new LoginInfoDto(
            administrator.administratorId,
            administrator.username,
            token,
            refreshToken,
            this.getIsoDate(jwtRefresData.exp)
        ) ;

        await this.administratorService.addToken(
            administrator.administratorId, 
            refreshToken, 
            this.getDatabaseDateFormat(this.getIsoDate(jwtRefresData.exp))
        );

        return new Promise(resolve => resolve(responseObject))

    }

    @Post('administrator/refresh') //http://localhost:3000/auth/administrator/refresh
    async administratorTokenRefresh(@Req() req: Request, @Body() data: AdministratorRefreshTokenDto):Promise<LoginInfoDto | ApiResponse> {
        const administratorToken = await this.administratorService.getAdministratorToken(data.token)

        if(!administratorToken){
            return new ApiResponse('error', -10002, 'No such refresh token!')
        }

        if(administratorToken.isValid === 0){
            return new ApiResponse('error', -10003, 'The token is no longer valid!')
        }

        const sada = new Date();
        const datumIsteka = new Date(administratorToken.expiresAt);

        if(datumIsteka.getTime() < sada.getTime()){
            return new ApiResponse('error', -10004, 'The token has expired!!')
        }

        let jwtRefreshData: JwtRefreshDataDto;

        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
        } catch (e) {
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData) {
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip !== req.ip.toString()) {
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        // if (jwtRefreshData.ua !== req.headers["user-agent"]) {
        //     throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        // }

        const jwtData = new JwtDataDto();
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDatePlus(60 * 10); // 10 min token traje
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        let token: string =  jwt.sign(jwtData.toPlainObject(), jwtSecret); //GEN !!

        const responseObject = new LoginInfoDto(
            jwtData.id,
            jwtData.identity,
            token,
            data.token,
            this.getIsoDate(jwtRefreshData.exp)
        ) ;

        return responseObject;
    }

    @Post('user/register') // POST http://localhost:3000/auth/user/register/
    async userRegister(@Body() data: UserRegistrationDto){
        return await this.userService.register(data)
    }


    @Post('user/login')// POST http://localhost:3000/auth/user/login
    async doUserLogin(@Body() data: LoginUserDto, @Req() req: Request): Promise<LoginInfoDto | ApiResponse> {
        const user = await this.userService.getByEmail(data.email);

        if (!user) {
            return new Promise(resolve => resolve(new ApiResponse("error", -3001))); //user nije pronadjen
        }

        const passwordHash = crypto.createHash('sha512')
        passwordHash.update(data.password)
        const passwordHashString = passwordHash.digest('hex').toUpperCase()


        if (user.passwordHash !== passwordHashString) {
            return new Promise(resolve => resolve(new ApiResponse("error", -3002)));// password nije ispravan
        }
        
        const jwtData = new JwtDataDto();
        jwtData.role = "user";
        jwtData.id = user.userId;
        jwtData.identity = user.email;
        jwtData.exp = this.getDatePlus(60 * 5); // 5 min token traje
        jwtData.ip = req.ip.toString();
        jwtData.ua = req.headers["user-agent"];

        let token: string =  jwt.sign(jwtData.toPlainObject(), jwtSecret); //GEN !!

        const jwtRefresData = new JwtRefreshDataDto();
        jwtRefresData.role = jwtData.role;
        jwtRefresData.id = jwtData.id;
        jwtRefresData.identity = jwtData.identity;
        jwtRefresData.exp = this.getDatePlus(60 * 60 * 24 * 31);// koliko sekundi od sada...31 dan
        // jwtRefresData.exp = this.getDatePlus(60 * 8);// koliko sekundi od sada...8 min
        jwtRefresData.ip = jwtData.ip;
        jwtRefresData.ua = jwtData.ua;

        let refreshToken: string =  jwt.sign(jwtRefresData.toPlainObject(), jwtSecret); //GEN !!

        const responseObject = new LoginInfoDto(
            user.userId,
            user.email,
            token,
            refreshToken,
            this.getIsoDate(jwtRefresData.exp)
        ) ;

        await this.userService.addToken(
            user.userId, 
            refreshToken, 
            this.getDatabaseDateFormat(this.getIsoDate(jwtRefresData.exp))
        );

        return new Promise(resolve => resolve(responseObject));

    }
    @Post('user/refresh') //http://localhost:3000/auth/user/refresh
    async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto):Promise<LoginInfoDto | ApiResponse> {
        // console.log('Poceo proces osvezavanja tokena...')
        // console.log('Podaci primljeni u zahtevu:', data.token);
        const userToken = await this.userService.getUserToken(data.token)
        
        if(!userToken){
            // console.log('Token nije pronadjen u zahtevu.')
            return new ApiResponse('error', -10002, 'No such refresh token!')
        }

        if(userToken.isValid === 0){
            // console.log('Token vise nije vazeci')
            return new ApiResponse('error', -10003, 'The token is no longer valid!')
        }

        // const sada = new Date();
        // const datumIstekaString = userToken.expiresAt;
        // console.log(datumIstekaString)
        // const datumIsteka = new Date(datumIstekaString.replace(" ", "T")+"Z");
        const sada = new Date();
        const datumIsteka = new Date(userToken.expiresAt)

        if(datumIsteka.getTime() < sada.getTime()){
            // console.log('Token je istekao')
            return new ApiResponse('error', -10004, 'The token has expired!!')
        }

        let jwtRefreshData: JwtRefreshDataDto;

        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
        } catch (e) {
            // console.log('Greska pri verifikaciji tokena.',e)
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtRefreshData) {
            // console.log('Greška pri verifikaciji tokena, jwtRefreshData je null!');
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (jwtRefreshData.ip !== req.ip.toString()) {
            // console.log('IP adresa ne odgovara!');
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        // if (jwtRefreshData.ua !== req.headers["user-agent"]) {
        //     // console.log('User-agent ne odgovara!');
        //     throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        // }

        const jwtData = new JwtDataDto();
        jwtData.role = jwtRefreshData.role;
        jwtData.id = jwtRefreshData.id;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp = this.getDatePlus(60 * 5); // 5 min token traje
        jwtData.ip = jwtRefreshData.ip;
        jwtData.ua = jwtRefreshData.ua;

        let token: string =  jwt.sign(jwtData.toPlainObject(), jwtSecret); //GEN !!

        // const newRefreshToken = jwt.sign(jwtRefreshData.toPlainObject(), jwtSecret)

        const responseObject = new LoginInfoDto(
            jwtData.id,
            jwtData.identity,
            token,
            data.token,
            this.getIsoDate(jwtRefreshData.exp)
        ) ;

        return responseObject;

        // console.log('Osvežen token:', responseObject);

        // await this.userService.updateToken(
        //     data.token,
        //     newRefreshToken,
        //     this.getDatabaseDateFormat(this.getIsoDate(jwtRefreshData.exp))
        // )

        // console.log('Token uspešno ažuriran u bazi.');

        // return responseObject;
    }

    private getDatePlus(numberOfSecounds: number):number{
        const results = new Date().getTime() / 1000.0  + numberOfSecounds; 
        
        // console.log(`Generisano vreme plus ${numberOfSecounds} sekundi:${results}`);
        // trenutni datum, trenutno vreme tog datuma preracunatih u sekunde i dodati broj sekundi
        return results;
    }

    private getIsoDate(timestamp: number):string{
        const date = new Date();
        date.setTime(timestamp * 1000);
        const isoDate = date.toISOString();
        return isoDate;
    }

    private getDatabaseDateFormat(isoFormat: string):string {
        const dbFormat = isoFormat.substring(0,19).replace('T', ' ');
        // console.log(`Konvertovan ISO format ${isoFormat} u DB format: ${dbFormat}`);
        return dbFormat;
    }
}