import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DrawingsService } from './drawings/drawings.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API Routing Prefix (exclude root '/' for health checks & info)
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Global Architectural Pipes & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Whiteboard Studio Enterprise API')
    .setDescription(
      'NestJS + Neon PostgreSQL (Prisma) + Cloudinary + WebSockets Real-Time Collaboration API',
    )
    .setVersion('2.1')
    .addTag('drawings', 'Drawings CRUD, search, and vector persistence')
    .addTag('health', 'System & database health monitoring')
    .addTag('legacy-compat', 'Backward compatibility routes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Seed sample drawings on initial cold start
  try {
    const drawingsService = app.get(DrawingsService);
    await drawingsService.seedSamples();
  } catch (err) {
    logger.warn(`Initial sample seed check skipped: ${err?.message || err}`);
  }

  const port = process.env.PORT || 8080;
  await app.listen(port);

  logger.log(`🚀 NestJS Backend running at http://localhost:${port}/api`);
  logger.log(`📚 Swagger documentation at http://localhost:${port}/api/docs`);
  logger.log(`⚡ WebSocket Collaboration Gateway ready at ws://localhost:${port}/collaboration`);
}

bootstrap();
