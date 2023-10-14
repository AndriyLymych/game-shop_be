import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as uuid from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

@Injectable()
export class FilesService {
  private s3: Record<string, any>;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
      /**
       * When working locally, we'll use the Localstack endpoints. This is the one for S3.
       * A full list of endpoints for each service can be found in the Localstack docs.
       */
      endpoint:
        process.env.NODE_ENV === 'development' &&
        process.env.AWS_LOCAL_ENDPOINT,
      s3ForcePathStyle: true,
    });
  }

  async getBucket(): Promise<Record<string, string> | false> {
    try {
      const { Buckets } = await this.s3.listBuckets().promise();

      return Buckets[0];
    } catch {
      return false;
    }
  }

  async createBucket(): Promise<void> {
    try {
      const isBucketAlreadyCreated = await this.getBucket();

      if (isBucketAlreadyCreated) {
        return;
      }

      await this.s3
        .createBucket({
          Bucket: process.env.AWS_BUCKET_NAME,
        })
        .promise();
    } catch (e) {
      throw new BadRequestException(`Failed to create s3 bucket: ${e.message}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    category: string,
  ): Promise<string> {
    try {
      const key = `${category}/${uuid.v4()}_${file.originalname}`;

      const { Location } = await this.s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
        })
        .promise();

      return Location;
    } catch (e) {
      throw new BadRequestException(`Failed to add file to s3: ${e.message}`);
    }
  }
}