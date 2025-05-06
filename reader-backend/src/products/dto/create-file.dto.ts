import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateFileDto {
    @IsString()
    @MinLength(1)
    name: string;
    @IsNumber()
    price: number;
    expiration: Date;
    currency_rates: Record<string, number>;
}