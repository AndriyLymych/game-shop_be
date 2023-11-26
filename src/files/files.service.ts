import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as uuid from 'uuid';

import { FILE_CATEGORY } from '../constants/fileFoldersCategory';
import { UsersService } from '../users/users.service';
import { LoggerService } from '../logger/logger.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

export interface UploadFile {
  link: string;
}

@Injectable()
export class FilesService {
  private s3: Record<string, any>;

  constructor(
    private logger: LoggerService,
    private usersService: UsersService,
  ) {
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

      if (Buckets[0]) {
        this.logger.info({
          message: 'Getting S3 Bucket...',
          context: {
            service: FilesService.name,
            method: this.getBucket.name,
          },
          payload: {
            bucket: Buckets[0].Name,
          },
        });
      }

      return Buckets[0];
    } catch (e) {
      this.logger.error({
        message: e.message,
        trace: e.stack,
        context: {
          service: FilesService.name,
          method: this.getBucket.name,
        },
      });

      return false;
    }
  }

  async createBucket(): Promise<void> {
    try {
      const isBucketAlreadyCreated = await this.getBucket();

      if (isBucketAlreadyCreated) {
        return;
      }

      const { Location } = await this.s3
        .createBucket({
          Bucket: process.env.AWS_BUCKET_NAME,
        })
        .promise();

      this.logger.info({
        message: 'S3 Bucket is successfully created',
        context: {
          service: FilesService.name,
          method: this.createBucket.name,
        },
        payload: {
          bucket: Location,
        },
      });
    } catch (e) {
      this.logger.error({
        message: e.message,
        trace: e.stack,
        context: {
          service: FilesService.name,
          method: this.createBucket.name,
        },
      });

      throw new BadRequestException(`Failed to create s3 bucket: ${e.message}`);
    }
  }

  async upload(
    file: Express.Multer.File,
    category: FILE_CATEGORY,
  ): Promise<UploadFile> {
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

      this.logger.info({
        message: 'File is successfully uploaded to s3',
        context: {
          service: FilesService.name,
          method: this.upload.name,
        },
        payload: {
          fileLink: Location,
        },
      });

      return { link: Location };
    } catch (e) {
      throw new BadRequestException(`Failed to add file to s3: ${e.message}`);
    }
  }

  async remove(link: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: link,
        })
        .promise();

      this.logger.info({
        message: 'File is successfully removed from s3',
        context: {
          service: FilesService.name,
          method: this.remove.name,
        },
        payload: {
          link,
        },
      });

      return;
    } catch (e) {
      throw new BadRequestException(
        `Failed to remove file from s3: ${e.message}`,
      );
    }
  }

  async updateAvatar(
    file: Express.Multer.File,
    category: FILE_CATEGORY,
    userId: number,
  ): Promise<UploadFile> {
    const { link } = await this.upload(file, category);

    try {
      const { avatar } = await this.usersService.updateById(userId, {
        avatar: link,
      });

      return { link: avatar };
    } catch (e) {
      await this.remove(link);

      throw new BadRequestException(
        `Failed to update avatar to user ${userId}: ${e.message}`,
      );
    }
  }
}
