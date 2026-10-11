import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private s3: S3Client;
    private bucket: string;

    constructor(private readonly config: ConfigService) {
        const endpoint = this.config.get<string>('B2_ENDPOINT');
        const region = this.config.get<string>('B2_REGION') || 'us-east-005';
        const accessKeyId = this.config.get<string>('B2_KEY_ID');
        const secretAccessKey = this.config.get<string>('B2_APP_KEY');
        this.bucket = this.config.get<string>('B2_BUCKET') as string;

        this.s3 = new S3Client({
            region,
            endpoint: endpoint?.startsWith('http') ? endpoint : `https://${endpoint}`,
            credentials: { accessKeyId: accessKeyId as string, secretAccessKey: secretAccessKey as string },
            forcePathStyle: true,
        });
    }

    async upload(key: string, body: Buffer | Uint8Array | Blob | string, contentType?: string) {
        const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType });
        await this.s3.send(cmd);
        return { key };
    }

    async getSignedUrl(key: string, expiresInSeconds = 3600) {
        const getCmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
        return getSignedUrl(this.s3, getCmd, { expiresIn: expiresInSeconds });
    }

    async delete(key: string) {
        try {
            await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        } catch (error) {
            this.logger.warn(`Failed to delete object ${key}: ${error.message}`);
        }
    }
}
