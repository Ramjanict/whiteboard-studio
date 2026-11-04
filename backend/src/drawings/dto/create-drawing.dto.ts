import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDrawingDto {
  @ApiPropertyOptional({ example: 'My Architecture Diagram' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Flowchart diagram for backend services' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'shape', default: 'shape' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Data URL or image URL of drawing', example: 'data:image/png;base64,...' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'JSON elements array of shapes and annotations' })
  @IsOptional()
  elements?: any;

  @ApiPropertyOptional({ description: 'Canvas appState (zoom, view background, etc.)' })
  @IsOptional()
  appState?: any;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isSample?: boolean;
}
