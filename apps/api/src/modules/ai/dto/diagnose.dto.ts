import { IsString, IsArray, IsOptional } from 'class-validator';

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
}
