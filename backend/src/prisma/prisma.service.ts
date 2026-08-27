import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(private _configService: ConfigService) {
        const adapter = new PrismaPg({
            connectionString: _configService.getOrThrow('DATABASE_URL')
        });

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}