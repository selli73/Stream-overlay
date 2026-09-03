import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {

    constructor(private _prismaService: PrismaService) {}

    async getStatusSession(userId: string) {
        const session = await this._prismaService.streamSession.findFirst({
            where: {
                userId,
                endTime: null
            },
            select: { id: true }
        });

        return {
            sessionId: session?.id ?? null,
            status: session ? 'active' : 'completed'
        };
    }

    async startSession(userId: string) {
        const existSession = await this._prismaService.streamSession.findFirst({
            where: {
                userId,
                endTime: null
            },
            select: {
                id: true
            }
        });

        if (existSession) {
            throw new BadRequestException('There is an open session; be sure to close it')
        }

        await this._prismaService.streamSession.create({
            data: {
                userId
            }
        });

        return {
            status: "active",
            message: 'Session successfully created'
        };
    }

    async endSession(userId: string) {
        const existSession = await this._prismaService.streamSession.findFirst({
            where: {
                userId,
                endTime: null
            },
            select: {
                id: true
            }
        });

        if (!existSession) {
            throw new BadRequestException('No open sessions found');
        }

        await this._prismaService.streamSession.update({
            where: {
                id: existSession.id
            },
            data: {
                endTime: new Date()
            }
        });

        return {
            status: "completed",
            message: 'The session has been successfully completed'
        };
    }
}
