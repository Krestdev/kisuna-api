import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class RustfsService implements OnModuleInit {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly logger = new Logger(RustfsService.name);

  constructor() {
    this.bucket = process.env.RUSTFS_BUCKET ?? 'hr-files';
    this.endpoint = process.env.RUSTFS_ENDPOINT ?? 'http://localhost:9001';

    this.client = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.RUSTFS_ACCESS_KEY ?? 'minioadmin',
        secretAccessKey: process.env.RUSTFS_SECRET_KEY ?? 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" already exists`);
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" created`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<string> {
    const objectKey = `${folder}/${Date.now()}-${file.originalname}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          size: String(file.size),
        },
      }),
    );

    const fullPath = `${this.endpoint}/${this.bucket}/${objectKey}`;
    this.logger.log(`Uploaded: ${fullPath}`);
    return fullPath;
  }

  async uploadBuffer(
    buffer: Buffer,
    filePath: string,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          size: String(buffer.length),
        },
      }),
    );

    const fullPath = `${this.endpoint}/${this.bucket}/${filePath}`;
    this.logger.log(`Uploaded buffer: ${fullPath}`);
    return fullPath;
  }

  async getFileUrl(fullPath: string, expiresIn = 3600): Promise<string> {
    const objectKey = this.extractObjectKey(fullPath);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteFile(fullPath: string): Promise<void> {
    const objectKey = this.extractObjectKey(fullPath);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );

    this.logger.log(`Deleted: ${fullPath}`);
  }

  private extractObjectKey(fullPath: string): string {
    // If it's already just an object key (backward compatibility)
    if (!fullPath.startsWith('http')) {
      return fullPath;
    }
    // Extract object key from full URL: http://localhost:9000/bucket/path/to/file
    const parts = fullPath.split(`/${this.bucket}/`);
    return parts[1] || fullPath;
  }
}
