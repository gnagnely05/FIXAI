import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';

export class DiagnoseDto {
  @IsString()
  serviceType: string;

  @IsArray()
  @IsString({ each: true })
  messages: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  clientTurns?: number;
}
