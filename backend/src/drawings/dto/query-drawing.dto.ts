import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryDrawingDto {
  @ApiPropertyOptional({ description: 'Filter by category (shape, annotation, etc.)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Search term for title or short ID' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter sample drawings' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isSample?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['latest', 'oldest', 'title'], default: 'latest' })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
