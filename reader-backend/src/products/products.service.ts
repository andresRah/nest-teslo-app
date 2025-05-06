import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Products } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { ProcessFileResultDto } from './dto/process-file-result-dto';
import { parse, isValid } from 'date-fns';
import * as streamifier from 'streamifier';
import * as sanitizeHtml from 'sanitize-html';
import * as csv from 'csv-parser';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

@Injectable()
export class ProductsService extends TypeOrmCrudService<Products> {
  private readonly logger = new Logger(ProductsService.name);
  private readonly batchSize = 500; 

  /**
   * Creates an instance of FilesService.
   * @param {Repository<Products>} productRepository
   * @memberof FilesService
   */
  constructor(
    @InjectRepository(Products) private readonly productRepository: Repository<Products>,
  ) {
    super(productRepository);
  }

  /**
   * createProductWithRates
   *
   * @param {CreateFileDto} dto
   * @return {*}  {Promise<Files>}
   * @memberof FilesService
   */
  async createProductWithRates(dto: CreateFileDto): Promise<Products> {
    try {
      const product = this.productRepository.create(dto);
      return this.productRepository.save(product);
    } catch (error) {
      this.logger.error('Failed to create product:', error.message);
      throw new InternalServerErrorException('Failed to create product.');
    }
  }

  /**
   * processFile
   *
   * @param {Express.Multer.File} file
   * @param {Record<string, number>} rates
   * @return {*}  {Promise<ProcessFileResultDto>}
   * @memberof FilesService
   */
  async processFile(file: Express.Multer.File, rates: Record<string, number>): Promise<ProcessFileResultDto> {
    let processed = 0;
    let omitted = 0;
    const errors: string[] = [];
    const batch: any[] = [];

    try {
      await pipelineAsync(
        streamifier.createReadStream(file.buffer),
        csv({ separator: ';', headers: ['name', 'price', 'expiration'] }),
        async function* (source) {
          for await (const data of source) {
            try {
              if (!data) {
                omitted++;
                errors.push('Empty row encountered');
                continue;
              }

              const rawName = data['name'] || '';
              const rawPrice = data['price'] || '';
              const rawExpiration = data['expiration'] || '';

              const name = this.cleanProductName(rawName);
              const price = this.cleanProductPrice(rawPrice);
              const expirationDate = this.cleanProductExpirationDate(rawExpiration);

              if (!name || !price || !expirationDate) {
                omitted++;
                errors.push(`Missing required fields: ${JSON.stringify(data)}`);
                continue;
              }

              batch.push({ name, price, expiration: expirationDate, currency_rates: rates });

              if (batch.length >= this.batchSize) {
                await this.bulkInsertProducts(batch);
                processed += batch.length;
                batch.length = 0;
              }
            } catch (err: any) {
              omitted++;
              errors.push(`Error processing row: ${JSON.stringify(data)} - ${err.message}`);
            }
          }

          if (batch.length > 0) {
            await this.bulkInsertProducts(batch);
            processed += batch.length;
          }
        }.bind(this)
      );

      return {
        processed,
        omitted,
        errors,
        success: processed > 0
      };
    } catch (err: any) {
      throw new Error(`Stream processing failed: ${err.message}`);
    }
  }

  /**
   * Bulk insert rows into the database.
   *
   * @param {any[]} rows - Array of rows to insert.
   * @return {Promise<void>}
   */
  private async bulkInsertProducts(rows: any[]): Promise<void> {
    try {
      await this.productRepository.insert(rows);
    } catch (error) {
      this.logger.error('Failed to insert batch into the database:', error.message);
      throw new Error('Failed to insert batch into the database.');
    }
  }

  /**
   * cleanProductPrice
   *
   * @param {string} rawName
   * @return {*}  {string}
   * @memberof FilesService
   */
  cleanProductName(rawName: string): string {
    let cleanedName = sanitizeHtml(rawName, { allowedTags: [], allowedAttributes: {} });

    cleanedName = cleanedName.normalize('NFC');

    // 1. Remove emojis
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    cleanedName = cleanedName.replace(emojiRegex, '');

    // 2. Remove special characters
    cleanedName = cleanedName.replace(/\(.*?\)/g, '').trim();

    // 3. Remove common SQL injection
    cleanedName = cleanedName
      .replace(/\.\.\/+/g, '[removed]')
      .replace(/\/etc\/[\w.-]+/g, '[removed]')
      .replace(/DROP TABLE|SELECT|INSERT|DELETE|UPDATE|CREATE|EXEC/gi, '[removed]');

    // 4. Remove special characters
    cleanedName = cleanedName.replace(/[^a-zA-Z0-9 .,!?'"()\/_-]/g, '');

    // 5. Remove multiple spaces
    cleanedName = cleanedName.replace(/\s+/g, ' ').trim();

    return cleanedName;
  }

  /**
   * cleanProductPrice
   *
   * @param {string} rawPrice
   * @return {*}  {number}
   * @memberof FilesService
   */
  cleanProductPrice(rawPrice: string): number {
    let price = 0;
    if (typeof rawPrice === 'string') {
      let cleanedPriceString = rawPrice.replace(/[^0-9.]/g, '').trim();
      cleanedPriceString = sanitizeHtml(cleanedPriceString, {
        allowedTags: [],
        allowedAttributes: {}
      });
      const parsedPrice = parseFloat(cleanedPriceString);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        price = parsedPrice;
      }
    }
    return price;
  }

  /**
   * cleanProductExpirationDate
   *
   * @param {string} rawExpiration
   * @return {*}  {Date}
   * @memberof FilesService
   */
  cleanProductExpirationDate(rawExpiration: string): Date {
    const sanitizedExpiration = sanitizeHtml(rawExpiration || '', {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
    const parsedDate = parse(sanitizedExpiration, 'M/d/yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : null;
  }
}
