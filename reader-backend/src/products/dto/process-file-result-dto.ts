import { IsNumber, IsBoolean, IsArray } from 'class-validator';

export class ProcessFileResultDto {
  @IsNumber()
  omitted: number;

  @IsNumber()
  processed: number;

  @IsArray()
  errors: string[];

  @IsBoolean()
  success: boolean;
}
