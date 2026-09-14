import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

@Injectable()
export class EncryptionService {

    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor(private _configService: ConfigService) {
        const keyHex = this._configService.getOrThrow('ENCRYPTION_KEY');
        this.key = Buffer.from(keyHex, 'hex');
    }

    encrypt(text: string) {        
        const iv = randomBytes(12);
        
        const cipher = createCipheriv(this.algorithm, this.key, iv);

        const encrypted = Buffer.concat([cipher.update(text, 'utf-8'), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    decrypt(encryptedData: string) {
        const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');

        const decipher = createDecipheriv(
            this.algorithm, 
            this.key,
            Buffer.from(ivHex, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        const decrypted = [
            decipher.update(encryptedHex, 'hex', 'utf-8'),
            decipher.final('utf-8')
        ];

        return decrypted.join('');
    }
}