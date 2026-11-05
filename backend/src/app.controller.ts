import { Controller, Get, Head } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root' })
  getRoot() {
    return {
      status: 'online',
      name: 'Whiteboard Studio Enterprise API',
      version: '2.1.0',
      documentation: '/api/docs',
      health: '/api/health',
      endpoints: {
        drawings: '/api/drawings',
        collaboration: '/collaboration',
      },
    };
  }

  @Head()
  getHead() {
    return;
  }
}
