import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { QueryDrawingDto } from './dto/query-drawing.dto';

@Injectable()
export class DrawingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createDto: CreateDrawingDto) {
    const { url, publicId } = await this.cloudinary.uploadImage(
      createDto.imageUrl,
      'whiteboard-drawings',
    );

    const drawing = await this.prisma.drawing.create({
      data: {
        title: createDto.title?.trim() || 'Untitled Board',
        description: createDto.description?.trim() || null,
        category: createDto.category || 'shape',
        imageUrl: url || createDto.imageUrl,
        thumbnailUrl: url || createDto.imageUrl,
        cloudinaryPublicId: publicId || null,
        elements: createDto.elements ? (createDto.elements as any) : [],
        appState: createDto.appState ? (createDto.appState as any) : null,
        isSample: createDto.isSample ?? false,
      },
    });

    return {
      success: true,
      message: 'Drawing uploaded successfully',
      data: drawing,
    };
  }

  async findAll(query: QueryDrawingDto) {
    const {
      category,
      search,
      isSample,
      sort = 'latest',
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (isSample !== undefined) {
      where.isSample = isSample;
    }

    if (search && search.trim()) {
      const searchNum = parseInt(search.trim(), 10);
      if (!isNaN(searchNum)) {
        where.OR = [
          { shortId: searchNum },
          { title: { contains: search.trim(), mode: 'insensitive' } },
        ];
      } else {
        where.title = { contains: search.trim(), mode: 'insensitive' };
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'title') {
      orderBy = { title: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.drawing.count({ where }),
      this.prisma.drawing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      message: 'Drawings fetched successfully',
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    let drawing = null;
    const numericId = parseInt(id, 10);

    if (!isNaN(numericId)) {
      drawing = await this.prisma.drawing.findFirst({
        where: {
          OR: [{ id: id }, { shortId: numericId }],
        },
      });
    } else {
      drawing = await this.prisma.drawing.findUnique({
        where: { id },
      });
    }

    if (!drawing) {
      throw new NotFoundException(`Drawing with ID "${id}" not found`);
    }

    return {
      success: true,
      message: 'Drawing retrieved successfully',
      data: drawing,
    };
  }

  async update(id: string, updateDto: UpdateDrawingDto) {
    // Find existing
    const existing = await this.findOne(id);
    const drawingId = existing.data.id;

    let imageUrl = updateDto.imageUrl;
    let publicId = existing.data.cloudinaryPublicId;

    if (
      updateDto.imageUrl &&
      updateDto.imageUrl !== existing.data.imageUrl &&
      !updateDto.imageUrl.startsWith('http')
    ) {
      const uploadRes = await this.cloudinary.uploadImage(
        updateDto.imageUrl,
        'whiteboard-drawings',
      );
      imageUrl = uploadRes.url;
      // remove old asset if replaced
      if (publicId && publicId !== uploadRes.publicId) {
        await this.cloudinary.deleteImage(publicId);
      }
      publicId = uploadRes.publicId || publicId;
    }

    const updated = await this.prisma.drawing.update({
      where: { id: drawingId },
      data: {
        ...(updateDto.title !== undefined && { title: updateDto.title }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.category !== undefined && { category: updateDto.category }),
        ...(imageUrl && { imageUrl, thumbnailUrl: imageUrl }),
        ...(publicId && { cloudinaryPublicId: publicId }),
        ...(updateDto.elements !== undefined && { elements: updateDto.elements as any }),
        ...(updateDto.appState !== undefined && { appState: updateDto.appState as any }),
        ...(updateDto.isSample !== undefined && { isSample: updateDto.isSample }),
      },
    });

    return {
      success: true,
      message: 'Drawing updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const drawingId = existing.data.id;

    if (existing.data.cloudinaryPublicId) {
      await this.cloudinary.deleteImage(existing.data.cloudinaryPublicId);
    }

    await this.prisma.drawing.delete({
      where: { id: drawingId },
    });

    return {
      success: true,
      message: 'Drawing deleted successfully',
      data: { id: drawingId },
    };
  }

  async findLatest() {
    const drawings = await this.prisma.drawing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    return {
      success: true,
      message: 'Latest drawings fetched',
      data: drawings,
    };
  }

  async findSamples() {
    const samples = await this.prisma.drawing.findMany({
      where: { isSample: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      message: 'Sample drawings fetched',
      data: samples,
    };
  }

  async seedSamples() {
    const count = await this.prisma.drawing.count({ where: { isSample: true } });
    if (count > 0) {
      return { message: 'Samples already exist' };
    }

    const sampleDrawings = [
      {
        title: 'MERN & NestJS Architecture Sample',
        description: 'Modern full-stack system architecture flowchart with PostgreSQL and Cloudinary',
        category: 'shape',
        isSample: true,
        imageUrl:
          'https://res.cloudinary.com/dmeg0t89b/image/upload/v1730700000/samples/architecture-sample.png',
        elements: [
          {
            id: 'sample-1',
            type: 'rectangle',
            x: 100,
            y: 80,
            width: 180,
            height: 90,
            strokeColor: '#3b82f6',
            fillColor: '#dbeafe',
            strokeWidth: 3,
            text: 'Next.js Frontend',
          },
          {
            id: 'sample-2',
            type: 'arrow',
            startX: 280,
            startY: 125,
            endX: 420,
            endY: 125,
            strokeColor: '#64748b',
            strokeWidth: 3,
          },
          {
            id: 'sample-3',
            type: 'rectangle',
            x: 420,
            y: 80,
            width: 180,
            height: 90,
            strokeColor: '#10b981',
            fillColor: '#d1fae5',
            strokeWidth: 3,
            text: 'NestJS Backend',
          },
          {
            id: 'sample-4',
            type: 'arrow',
            startX: 510,
            startY: 170,
            endX: 510,
            endY: 260,
            strokeColor: '#64748b',
            strokeWidth: 3,
          },
          {
            id: 'sample-5',
            type: 'diamond',
            x: 430,
            y: 260,
            width: 160,
            height: 100,
            strokeColor: '#8b5cf6',
            fillColor: '#ede9fe',
            strokeWidth: 3,
            text: 'Neon PostgreSQL',
          },
        ],
      },
      {
        title: 'Quick Annotation & Brainstorming',
        description: 'Idea brainstorm whiteboard template with sticky notes and annotations',
        category: 'annotation',
        isSample: true,
        imageUrl:
          'https://res.cloudinary.com/dmeg0t89b/image/upload/v1730700000/samples/annotation-sample.png',
        elements: [
          {
            id: 'sample-note-1',
            type: 'sticky',
            x: 80,
            y: 90,
            width: 160,
            height: 160,
            fillColor: '#fef08a',
            strokeColor: '#eab308',
            text: '✨ Modern UI:\n- Next.js 14\n- Tailwind CSS\n- shadcn styling',
          },
          {
            id: 'sample-note-2',
            type: 'sticky',
            x: 280,
            y: 90,
            width: 160,
            height: 160,
            fillColor: '#bbf7d0',
            strokeColor: '#22c55e',
            text: '⚡ Backend Stack:\n- NestJS Modular\n- Prisma ORM\n- Neon Postgres',
          },
          {
            id: 'sample-note-3',
            type: 'sticky',
            x: 480,
            y: 90,
            width: 160,
            height: 160,
            fillColor: '#fed7aa',
            strokeColor: '#f97316',
            text: '☁️ Cloud Storage:\n- Cloudinary CDN\n- Auto-optimizations\n- Secure URLs',
          },
        ],
      },
    ];

    for (const sample of sampleDrawings) {
      await this.prisma.drawing.create({
        data: sample as any,
      });
    }

    return { message: 'Samples seeded successfully' };
  }
}
