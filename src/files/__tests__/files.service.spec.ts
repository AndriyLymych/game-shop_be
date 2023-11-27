import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { UsersService } from '../../users/users.service';
import { LoggerService } from '../../logger/logger.service';
import { FILE_CATEGORY } from '../../constants/fileFoldersCategory';
import { FilesService, UploadFile } from '../files.service';

const usersServiceMock = {
  updateById: jest.fn((userId: number, { avatar }: any) => {
    if (userId === 0) {
      throw new Error('Wrong user id');
    }

    return {
      avatar,
    };
  }),
};

const loggerServiceMock = {
  info: jest.fn(),
  error: jest.fn(),
};

describe('FilesService', () => {
  const awsAccessKeyEnvOld = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretEnvOld = process.env.AWS_SECRET_KEY;
  const awsRegionEnvOld = process.env.AWS_REGION;
  const nodeEnvOld = process.env.NODE_ENV;
  const awsLocalEndpointEnvOld = process.env.AWS_LOCAL_ENDPOINT;
  const awsBucketNameEnvOld = process.env.AWS_BUCKET_NAME;

  let filesService: FilesService;

  beforeAll(async () => {
    process.env.AWS_ACCESS_KEY_ID = 'access_key';
    process.env.AWS_SECRET_KEY = 'secret';
    process.env.AWS_REGION = 'region';
    process.env.NODE_ENV = 'development';
    process.env.AWS_LOCAL_ENDPOINT = 'http://local';
    process.env.AWS_BUCKET_NAME = 'bucketName';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        { provide: LoggerService, useValue: loggerServiceMock },
      ],
    }).compile();

    filesService = module.get<FilesService>(FilesService);
  });

  afterAll(() => {
    process.env.AWS_ACCESS_KEY_ID = awsAccessKeyEnvOld;
    process.env.AWS_SECRET_KEY = awsSecretEnvOld;
    process.env.AWS_REGION = awsRegionEnvOld;
    process.env.NODE_ENV = nodeEnvOld;
    process.env.AWS_LOCAL_ENDPOINT = awsLocalEndpointEnvOld;
    process.env.AWS_BUCKET_NAME = awsBucketNameEnvOld;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBucket', () => {
    it('gets bucket successfully', async () => {
      jest.spyOn(filesService['s3'], 'listBuckets').mockImplementation(() => ({
        promise: jest
          .fn()
          .mockResolvedValue({ Buckets: [{ Name: 'bucket_name' }] }),
      }));

      const result = await filesService.getBucket();

      expect(result).toEqual({ Name: 'bucket_name' });
      expect(loggerServiceMock.info).toBeCalledWith({
        context: {
          method: 'getBucket',
          service: 'FilesService',
        },
        message: 'Getting S3 Bucket...',
        payload: {
          bucket: 'bucket_name',
        },
      });
    });

    it('throws an error and returns false if something went wrong', async () => {
      jest.spyOn(filesService['s3'], 'listBuckets').mockImplementation(() => ({
        promise: jest.fn(() => {
          throw new Error('List bucket error');
        }),
      }));

      const result = await filesService.getBucket();

      expect(result).toBe(false);

      expect(loggerServiceMock.error).toBeCalledWith({
        context: {
          method: 'getBucket',
          service: 'FilesService',
        },
        message: 'List bucket error',
        trace: expect.anything(),
      });
    });
  });

  describe('createBucket', () => {
    it('creates bucket successfully', async () => {
      jest.spyOn(filesService['s3'], 'listBuckets').mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Buckets: [] }),
      }));

      jest.spyOn(filesService['s3'], 'createBucket').mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Location: 'bucket_link' }),
      }));

      await filesService.createBucket();

      expect(loggerServiceMock.info).toBeCalledWith({
        context: {
          method: 'createBucket',
          service: 'FilesService',
        },
        message: 'S3 Bucket is successfully created',
        payload: {
          bucket: 'bucket_link',
        },
      });
    });

    it('returns if bucket already created', async () => {
      jest.spyOn(filesService['s3'], 'listBuckets').mockImplementation(() => ({
        promise: jest
          .fn()
          .mockResolvedValue({ Buckets: [{ Name: 'bucket_name' }] }),
      }));

      await filesService.createBucket();

      expect(loggerServiceMock.info).toBeCalledWith({
        context: {
          method: 'getBucket',
          service: 'FilesService',
        },
        message: 'Getting S3 Bucket...',
        payload: {
          bucket: 'bucket_name',
        },
      });

      expect(loggerServiceMock.info).not.toBeCalledWith({
        context: {
          method: 'createBucket',
          service: 'FilesService',
        },
        message: 'S3 Bucket is successfully created',
        payload: {
          bucket: 'bucket_link',
        },
      });
    });

    it('throws an error if something went wrong', async () => {
      jest.spyOn(filesService['s3'], 'listBuckets').mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Buckets: [] }),
      }));

      jest.spyOn(filesService['s3'], 'createBucket').mockImplementation(() => ({
        promise: jest.fn(() => {
          throw new Error('Create Bucket error');
        }),
      }));

      await expect(filesService.createBucket()).rejects.toThrow(
        new BadRequestException(
          'Failed to create s3 bucket: Create Bucket error',
        ),
      );

      expect(loggerServiceMock.error).toBeCalledWith({
        context: {
          method: 'createBucket',
          service: 'FilesService',
        },
        message: 'Create Bucket error',
        trace: expect.anything(),
      });
    });
  });

  describe('upload', () => {
    const file = {
      originalname: 'test.txt',
      buffer: Buffer.from('test content'),
    } as Express.Multer.File;

    it('uploads file to S3 successfully', async () => {
      const result: UploadFile = {
        link: 'https://s3.example.com/test.txt',
      };

      jest.spyOn(filesService['s3'], 'upload').mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Location: result.link }),
      }));

      const uploadedFile = await filesService.upload(file, FILE_CATEGORY.USERS);

      expect(uploadedFile).toEqual(result);
      expect(loggerServiceMock.info).toBeCalledWith({
        context: {
          method: 'upload',
          service: 'FilesService',
        },
        message: 'File is successfully uploaded to s3',
        payload: {
          fileLink: result.link,
        },
      });
    });

    it('throws an error if something went wrong', async () => {
      jest.spyOn(filesService['s3'], 'upload').mockImplementation(() => ({
        promise: jest.fn(() => {
          throw new Error('Upload error');
        }),
      }));

      await expect(
        filesService.upload(file, FILE_CATEGORY.USERS),
      ).rejects.toThrow(
        new BadRequestException('Failed to add file to s3: Upload error'),
      );
    });
  });

  describe('remove', () => {
    it('removes file from S3 successfully', async () => {
      jest.spyOn(filesService['s3'], 'deleteObject').mockImplementation(() => ({
        promise: jest.fn(),
      }));

      await filesService.remove('file_link');

      expect(loggerServiceMock.info).toBeCalledWith({
        context: {
          method: 'remove',
          service: 'FilesService',
        },
        message: 'File is successfully removed from s3',
        payload: {
          link: 'file_link',
        },
      });
    });

    it('throws an error if something went wrong', async () => {
      jest.spyOn(filesService['s3'], 'deleteObject').mockImplementation(() => ({
        promise: jest.fn(() => {
          throw new Error('Remove file error');
        }),
      }));

      await expect(filesService.remove('file_link')).rejects.toThrow(
        new BadRequestException(
          'Failed to remove file from s3: Remove file error',
        ),
      );
    });
  });

  describe('updateAvatar', () => {
    const file = {
      originalname: 'test.txt',
      buffer: Buffer.from('test content'),
    } as Express.Multer.File;

    it('updates user avatar successfully', async () => {
      jest.spyOn(filesService['s3'], 'upload').mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Location: 'avatar_link' }),
      }));

      const result = await filesService.updateAvatar(
        file,
        FILE_CATEGORY.USERS,
        1,
      );

      expect(result).toEqual({
        link: 'avatar_link',
      });
    });

    it('throws an error and removes already added avatar to s3 if user was not updated', async () => {
      jest.spyOn(filesService['s3'], 'upload').mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ Location: 'avatar_link' }),
      }));

      jest.spyOn(filesService['s3'], 'deleteObject').mockImplementation(() => ({
        promise: jest.fn(),
      }));

      await expect(
        filesService.updateAvatar(file, FILE_CATEGORY.USERS, 0),
      ).rejects.toThrow(
        new BadRequestException(
          'Failed to update avatar to user 0: Wrong user id',
        ),
      );
    });
  });
});
