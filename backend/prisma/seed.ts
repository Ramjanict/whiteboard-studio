import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial sample drawings...');

  const samples = [
    {
      title: 'MERN & NestJS Architecture Sample',
      description: 'System architecture diagram with Next.js, NestJS, Neon PostgreSQL, and Cloudinary',
      category: 'shape',
      isSample: true,
      imageUrl: 'https://res.cloudinary.com/dmeg0t89b/image/upload/v1730700000/samples/architecture-sample.png',
      elements: [
        {
          id: 'rect-1',
          type: 'rectangle',
          x: 120,
          y: 100,
          width: 200,
          height: 100,
          strokeColor: '#3b82f6',
          fillColor: '#eff6ff',
          strokeWidth: 3,
          text: 'Next.js 14 (TypeScript)',
        },
        {
          id: 'arrow-1',
          type: 'arrow',
          startX: 320,
          startY: 150,
          endX: 460,
          endY: 150,
          strokeColor: '#64748b',
          strokeWidth: 3,
        },
        {
          id: 'rect-2',
          type: 'rectangle',
          x: 460,
          y: 100,
          width: 200,
          height: 100,
          strokeColor: '#10b981',
          fillColor: '#f0fdf4',
          strokeWidth: 3,
          text: 'NestJS REST API',
        },
        {
          id: 'arrow-2',
          type: 'arrow',
          startX: 560,
          startY: 200,
          endX: 560,
          endY: 300,
          strokeColor: '#64748b',
          strokeWidth: 3,
        },
        {
          id: 'diamond-1',
          type: 'diamond',
          x: 470,
          y: 300,
          width: 180,
          height: 110,
          strokeColor: '#8b5cf6',
          fillColor: '#f5f3ff',
          strokeWidth: 3,
          text: 'Neon PostgreSQL (Prisma)',
        },
      ],
      appState: {
        zoom: 1,
        viewBackgroundColor: '#ffffff',
        grid: true,
      },
    },
    {
      title: 'Product Brainstorm & Sticky Notes',
      description: 'Design thinking board with annotations and sticky notes',
      category: 'annotation',
      isSample: true,
      imageUrl: 'https://res.cloudinary.com/dmeg0t89b/image/upload/v1730700000/samples/annotation-sample.png',
      elements: [
        {
          id: 'sticky-1',
          type: 'sticky',
          x: 100,
          y: 100,
          width: 180,
          height: 180,
          fillColor: '#fef08a',
          strokeColor: '#ca8a04',
          text: '🚀 Modern Features:\n- Infinite Canvas\n- Shapes & Sticky Notes\n- Undo/Redo & Zoom\n- PNG & SVG Export',
        },
        {
          id: 'sticky-2',
          type: 'sticky',
          x: 320,
          y: 100,
          width: 180,
          height: 180,
          fillColor: '#bbf7d0',
          strokeColor: '#16a34a',
          text: '⚡ Backend Modernization:\n- NestJS Modular\n- Prisma Client\n- PostgreSQL Pooler\n- Cloudinary Storage',
        },
        {
          id: 'sticky-3',
          type: 'sticky',
          x: 540,
          y: 100,
          width: 180,
          height: 180,
          fillColor: '#fed7aa',
          strokeColor: '#ea580c',
          text: '🎨 UI & UX:\n- Tailwind CSS\n- Lucide Icons\n- Dark & Light mode\n- Cloud sync gallery',
        },
      ],
      appState: {
        zoom: 1,
        viewBackgroundColor: '#ffffff',
        grid: true,
      },
    },
  ];

  for (const sample of samples) {
    await prisma.drawing.create({
      data: sample as any,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
