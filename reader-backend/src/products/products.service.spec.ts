import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { ProcessFileResultDto } from './dto/process-file-result-dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Products>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Products),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            metadata: {
              connection: {
                options: {},
              },
              target: Products,
              columns: [],
              relations: [],
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Products>>(getRepositoryToken(Products));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProductWithRates', () => {
    it('should create and save a product', async () => {
      const createFileDto: CreateFileDto = {
        name: 'Test Product',
        price: 100,
        expiration: new Date(),
        currency_rates: { USD: 1, EUR: 0.9 }
      };
      const product = new Products();
      jest.spyOn(repository, 'create').mockReturnValue(product);
      jest.spyOn(repository, 'save').mockResolvedValue(product);

      const result = await service.createProductWithRates(createFileDto);
      expect(result).toEqual(product);
      expect(repository.create).toHaveBeenCalledWith(createFileDto);
      expect(repository.save).toHaveBeenCalledWith(product);
    });

    it('should throw an InternalServerErrorException if saving fails', async () => {
      const createFileDto: CreateFileDto = {
        name: 'Test Product',
        price: 100,
        expiration: new Date(),
        currency_rates: { USD: 1, EUR: 0.9 }
      };
      jest.spyOn(repository, 'create').mockReturnValue(new Products());
      jest.spyOn(repository, 'save').mockRejectedValue(new InternalServerErrorException('Save failed'));

      await expect(service.createProductWithRates(createFileDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('processFile', () => {
    it('should process the file and return the result', async () => {
      const file: Express.Multer.File = { originalname: 'test.csv', buffer: Buffer.from('test') } as Express.Multer.File;
      const rates: Record<string, number> = { USD: 1, EUR: 0.9 };
      const processFileResult: ProcessFileResultDto = { success: true, omitted: 0, processed: 0, errors: [] };

      jest.spyOn(service, 'processFile').mockResolvedValue(processFileResult);

      const result = await service.processFile(file, rates);
      expect(result).toEqual(processFileResult);
    });

    it('should throw an error if file processing fails', async () => {
      const file: Express.Multer.File = { originalname: 'test.csv', buffer: Buffer.from('test') } as Express.Multer.File;
      const rates: Record<string, number> = { USD: 1, EUR: 0.9 };

      jest.spyOn(service, 'processFile').mockRejectedValue(new Error('Processing error'));

      await expect(service.processFile(file, rates)).rejects.toThrow('Processing error');
    });
  });
});