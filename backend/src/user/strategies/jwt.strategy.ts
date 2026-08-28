import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwt } from "../user.constants";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                return req.cookies['access_token']
            }]),
            ignoreExpiration: false,
            secretOrKey: jwt.secret
        });
    }

    validate(payload: any) {
        
        if (!payload.sub) {
            throw new BadRequestException('Недействительный токен');
        }

        return { userId: payload.sub };
    }
}