import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as jwt from 'jsonwebtoken';
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { jwtSecret } from "config/jwt.secret";
import { UserService } from "src/services/user/user.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly administratorService: AdministratorService,
        private readonly userService: UserService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {

        const publicPaths = [
            /^\/api\/category($|\/.*)/,
            /^\/api\/article($|\/.*)/,
            /^\/api\/user\/cart($|\/.*)/,
            /^\/api\/feature($|\/.*)/,
            /^\/api\/user\/cart\/addToCart($|\/.*)/,
        ];

        const isPublicPath = publicPaths.some(path => path.test(req.originalUrl));

        if (isPublicPath) {
            if (!req.headers.authorization) {
                req.role = 'visitor';
                return next();
            }

            const token = req.headers.authorization.split(' ')[1];

            let jwtData: JwtDataDto;

            try {
                jwtData = jwt.verify(token, jwtSecret) as JwtDataDto;
            } catch (e) {
                throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
            }

            if (!jwtData) {
                throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
            }

            if (jwtData.ip !== req.ip.toString()) {
                throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
            }

            if (jwtData.role === "administrator") {
                const administrator = await this.administratorService.getById(jwtData.id);
                if (!administrator) {
                    throw new HttpException('Account not found!', HttpStatus.UNAUTHORIZED);
                }
            } else if (jwtData.role === "user") {
                const user = await this.userService.getById(jwtData.id);
                if (!user) {
                    throw new HttpException('Account not found!', HttpStatus.UNAUTHORIZED);
                }
            }

            const currentTimeStamp = new Date().getTime() / 1000.0;

            if (currentTimeStamp >= jwtData.exp) {
                throw new HttpException('The token has expired!', HttpStatus.UNAUTHORIZED);
            }

            req.token = jwtData;
            req.role = jwtData.role;

            return next();
        }

        if (!req.headers.authorization) {
            throw new HttpException('Token not found!', HttpStatus.UNAUTHORIZED);
        }

        const token = req.headers.authorization.split(' ')[1];

        let jwtData: JwtDataDto;

        try {
            jwtData = jwt.verify(token, jwtSecret) as JwtDataDto;
        } catch (e) {
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (!jwtData) {
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.ip !== req.ip.toString()) {
            throw new HttpException('Bad token found!', HttpStatus.UNAUTHORIZED);
        }

        if (jwtData.role === "administrator") {
            const administrator = await this.administratorService.getById(jwtData.id);
            if (!administrator) {
                throw new HttpException('Account not found!', HttpStatus.UNAUTHORIZED);
            }
        } else if (jwtData.role === "user") {
            const user = await this.userService.getById(jwtData.id);
            if (!user) {
                throw new HttpException('Account not found!', HttpStatus.UNAUTHORIZED);
            }
        }

        const currentTimeStamp = new Date().getTime() / 1000.0;

        if (currentTimeStamp >= jwtData.exp) {
            throw new HttpException('The token has expired!', HttpStatus.UNAUTHORIZED);
        }

        req.token = jwtData;
        req.role = jwtData.role;

        next();
    }
}
