import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { ExchangeRateService } from './exchange-rate.service';
import { HttpModule } from '@nestjs/axios';

const ENTITIES: any[] = [
  Products
];

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ExchangeRateService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature(ENTITIES),
    HttpModule, 
  ],
  exports: [ExchangeRateService]
})
export class ProductsModule {}
