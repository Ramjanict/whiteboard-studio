import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Successfully connected to Neon PostgreSQL');
    await this.ensureTablesExist();
  }

  /**
   * Automatically creates the Drawing table and indexes in PostgreSQL if they don't exist yet,
   * eliminating the need to run manual Prisma migrations.
   */
  async ensureTablesExist() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Drawing" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "shortId" SERIAL UNIQUE NOT NULL,
          "title" TEXT NOT NULL DEFAULT 'Untitled Board',
          "description" TEXT,
          "category" TEXT NOT NULL DEFAULT 'shape',
          "imageUrl" TEXT NOT NULL,
          "thumbnailUrl" TEXT,
          "cloudinaryPublicId" TEXT,
          "elements" JSONB NOT NULL DEFAULT '[]'::jsonb,
          "appState" JSONB,
          "isSample" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Drawing_category_idx" ON "Drawing"("category");
      `);

      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Drawing_isSample_idx" ON "Drawing"("isSample");
      `);

      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Drawing_createdAt_idx" ON "Drawing"("createdAt");
      `);

      this.logger.log('✅ PostgreSQL Schema verified: Table "Drawing" is created and ready.');
    } catch (err: any) {
      this.logger.warn(`Auto-table verification notice: ${err?.message || err}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
