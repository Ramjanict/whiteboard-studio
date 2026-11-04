import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DrawingsService } from './drawings.service';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { QueryDrawingDto } from './dto/query-drawing.dto';

@ApiTags('drawings')
@Controller('drawings')
export class DrawingsController {
  constructor(private readonly drawingsService: DrawingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new drawing' })
  @ApiResponse({ status: 201, description: 'Drawing created successfully' })
  create(@Body() createDrawingDto: CreateDrawingDto) {
    return this.drawingsService.create(createDrawingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drawings with filtering and pagination' })
  findAll(@Query() query: QueryDrawingDto) {
    return this.drawingsService.findAll(query);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest drawings' })
  findLatest() {
    return this.drawingsService.findLatest();
  }

  @Get('sample')
  @ApiOperation({ summary: 'Get sample drawings' })
  findSamples() {
    return this.drawingsService.findSamples();
  }

  @Post('seed-samples')
  @ApiOperation({ summary: 'Seed initial sample drawings' })
  seedSamples() {
    return this.drawingsService.seedSamples();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drawing by ID or shortId' })
  findOne(@Param('id') id: string) {
    return this.drawingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drawing by ID' })
  update(@Param('id') id: string, @Body() updateDrawingDto: UpdateDrawingDto) {
    return this.drawingsService.update(id, updateDrawingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drawing by ID' })
  remove(@Param('id') id: string) {
    return this.drawingsService.remove(id);
  }
}

/**
 * Controller to maintain backward compatibility with legacy endpoints
 */
@ApiTags('legacy-compat')
@Controller()
export class LegacyCompatController {
  constructor(private readonly drawingsService: DrawingsService) {}

  @Post('upload-drawing')
  uploadDrawing(@Body() body: any) {
    return this.drawingsService.create({
      imageUrl: body.imageUrl,
      category: body.category || 'shape',
      title: body.text || 'Drawing',
      elements: body.elements || [],
    });
  }

  @Get('allDrawing')
  async getAllDrawing() {
    const res = await this.drawingsService.findAll({ limit: 100 });
    return {
      message: 'Get all drawing',
      error: false,
      success: true,
      data: res.data,
    };
  }

  @Get('latest')
  async getLatest() {
    const res = await this.drawingsService.findLatest();
    return {
      message: 'latestDrawing',
      error: false,
      success: true,
      data: res.data,
    };
  }

  @Get('sample')
  async getSample() {
    const res = await this.drawingsService.findSamples();
    return {
      message: 'Get all drawing',
      error: false,
      success: true,
      data: res.data,
    };
  }

  @Post('category')
  async categoryWiseDrawing(@Body() body: { category: string }) {
    const res = await this.drawingsService.findAll({
      category: body.category,
      limit: 100,
    });
    return {
      message: 'category',
      error: false,
      success: true,
      data: res.data,
    };
  }

  @Post('search')
  async searchById(@Body() body: { id: any }) {
    if (body.id) {
      try {
        const res = await this.drawingsService.findOne(String(body.id));
        return {
          message: 'result',
          error: false,
          success: true,
          data: res.data,
        };
      } catch {
        return {
          message: 'result',
          error: false,
          success: true,
          data: null,
        };
      }
    } else {
      const res = await this.drawingsService.findAll({ limit: 100 });
      return {
        message: 'result',
        error: false,
        success: true,
        data: res.data,
      };
    }
  }

  @Post('update')
  async updateDrawing(@Body() body: any) {
    const id = body._id || body.id;
    const res = await this.drawingsService.update(id, body);
    return {
      message: 'Update drawing successfully',
      error: false,
      success: true,
      data: res.data,
    };
  }

  @Post('delete')
  async deleteDrawing(@Body() body: { id: string }) {
    const res = await this.drawingsService.remove(body.id);
    return {
      message: 'Delete drawing successfully',
      error: false,
      success: true,
      data: res.data,
    };
  }
}
