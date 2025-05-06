import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { Products } from './entities/products.entity';
import { Crud, CrudController } from '@rewiko/crud';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateService } from './exchange-rate.service';
import { ProcessFileResultDto } from './dto/process-file-result-dto';

@Crud({
  model: {
    type: Products,
  }
})
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController implements CrudController<Products> {
  constructor(
    readonly service: ProductsService,
    readonly configService: ConfigService,
    readonly exchangeRateService: ExchangeRateService
  ) { }

  get base(): CrudController<Products> {
    return this;
  }

  /**
   * Handles file upload and processes the provided CSV file.
   *
   * @param {Express.Multer.File} file - The uploaded file.
   * @return {Promise<ProcessFileResultDto>} The result of the file processing.
   * @memberof FilesController
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { fileFilter: fileFilter }))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<ProcessFileResultDto> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided. Please upload a valid CSV file.');
      }

      const rates = await this.exchangeRateService.getRates();
      if (!rates || Object.keys(rates).length === 0) {
        throw new BadRequestException('No exchange rates found. Unable to process the file.');
      }

      // Process the file
      const result = await this.service.processFile(file, rates);
      return result;
    } catch (error) {
      console.error('Error during file upload and processing:', error.message);
      throw new BadRequestException(`File processing failed: ${error.message}`);
    }
  }
}