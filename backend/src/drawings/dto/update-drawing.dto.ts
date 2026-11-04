import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDrawingDto {
  @ApiPropertyOptional({ example: 'Updated Diagram Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'shape' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'New image data URL if modified' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'JSON elements array' })
  @IsOptional()
  elements?: any;

  @ApiPropertyOptional()
  @IsOptional()
  appState?: any;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSample?: boolean;
}
