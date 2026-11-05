# 🎨 Whiteboard Studio — Enterprise Real-Time Collaborative Canvas

<div align="center">

![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS 10](https://img.shields.io/badge/NestJS%2010-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon%20Postgres-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary%20CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-success?style=flat-square&logo=vercel)](https://yourwhiteboard.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Backend-Live%20on%20Render-informational?style=flat-square&logo=render)](https://whiteboard-studio-c21b.onrender.com/)
[![Swagger Docs](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat-square&logo=swagger&logoColor=black)](https://whiteboard-studio-c21b.onrender.com/api/docs)
[![Database](https://img.shields.io/badge/Database-Neon%20Serverless%20Pooler-00E599?style=flat-square&logo=postgresql&logoColor=black)](https://whiteboard-studio-c21b.onrender.com/api/health)

**A production-grade, full-stack collaborative digital whiteboard engineered with Next.js 14, TypeScript, NestJS 10, Neon Serverless PostgreSQL, Prisma ORM, Cloudinary, and Socket.IO.**

[Live Application](https://yourwhiteboard.vercel.app/) • [Swagger API Docs](https://whiteboard-studio-c21b.onrender.com/api/docs) • [Visual Showcase](#-visual-interface-tour) • [Architecture](#-system-architecture) • [API Specification](#-api-specification) • [Local Setup](#-getting-started)

</div>

---

## 🌐 Live Production Deployments

The application is deployed across global production infrastructure with automated continuous delivery:

| Service | Environment / Platform | Direct URL | Status |
| :--- | :--- | :--- | :---: |
| **Frontend Web App** | Vercel Edge Network | [https://yourwhiteboard.vercel.app/](https://yourwhiteboard.vercel.app/) | ![Active](https://img.shields.io/badge/Operational-brightgreen?style=flat-square) |
| **Backend API Gateway** | Render Cloud Web Service | [https://whiteboard-studio-c21b.onrender.com/](https://whiteboard-studio-c21b.onrender.com/) | ![Active](https://img.shields.io/badge/Operational-brightgreen?style=flat-square) |
| **Swagger OpenAPI 3.0** | Interactive Documentation | [https://whiteboard-studio-c21b.onrender.com/api/docs](https://whiteboard-studio-c21b.onrender.com/api/docs) | ![Interactive](https://img.shields.io/badge/v2.1.0-blue?style=flat-square) |
| **System & DB Health** | Diagnostics & Latency Probe | [https://whiteboard-studio-c21b.onrender.com/api/health](https://whiteboard-studio-c21b.onrender.com/api/health) | ![SSL Pooled](https://img.shields.io/badge/Neon_DB-Sub--15ms-00E599?style=flat-square) |
| **WebSocket Gateway** | Socket.IO Live Stream | `wss://whiteboard-studio-c21b.onrender.com/collaboration` | ![Realtime](https://img.shields.io/badge/40Hz-Low_Latency-purple?style=flat-square) |

---

## 📸 Visual Interface Tour

Experience the core features and developer architecture of Whiteboard Studio through high-resolution screenshots of the production software:

### 1. High-Performance Vector Canvas & Studio Workspace
The primary canvas workspace combines a distraction-free dark interface with an 11-tool palette, coordinate space transformation engine ($0.2\times$ to $3.0\times$ zoom and infinite pan), live Neon PostgreSQL status indicator, real-time minimap radar, and floating property inspector.

![Whiteboard Studio Workspace](frontend/public/hero-workspace.png)

* **Key Highlights**:
  * **11 Interactive Tools**: Select (`V`), Hand Pan (`H`), Rectangle (`R`), Circle (`C`), Diamond (`D`), Arrow (`A`), Line (`L`), Freehand Pencil (`P`), Text (`T`), Sticky Note (`S`), and Eraser (`E`).
  * **Retina High-DPI Scaling**: Pixel-perfect rendering matching `window.devicePixelRatio` with zero blurriness.
  * **Floating Properties Panel**: Real-time adjustment of stroke colors, fill swatches, stroke widths (2px, 4px, 8px), opacity, and element layering.
  * **Radar Minimap**: Semi-transparent viewport radar in the bottom-left corner with real-time viewport bounding box projection.

---

### 2. Real-Time Multiplayer Collaboration & Presence
Multi-user collaborative session powered by NestJS WebSockets and Socket.IO. Changes, moves, and remote cursors are relayed instantaneously across all active participants in isolated rooms.

![Multiplayer Collaboration Session](frontend/public/realtime-collaboration.png)

* **Key Highlights**:
  * **Throttled 40Hz Cursor Streaming**: High-frequency, low-bandwidth cursor coordinate transmission with colored pointer triangles and custom user nametags.
  * **Active Selection Bounding Box**: Dashed transformation handles indicating which collaborator is currently repositioning or editing a shape.
  * **Live Activity Feed**: Sidebar tracking participant joins, edits, sticky note placements, and connector updates with timestamped audit logs.
  * **Presence Indicators**: Active collaborator avatar stack in the top header displaying online team members.

---

### 3. Neon Serverless PostgreSQL Cloud Drawings Library
Unified drawing management modal displaying boards persisted in Neon PostgreSQL and rasterized to Cloudinary CDN.

![Cloud Drawings Library](frontend/public/cloud-gallery.png)

* **Key Highlights**:
  * **Dual Storage Engine**: Offscreen visual snapshots stored on Cloudinary CDN paired with complete vector element JSON trees in Neon PostgreSQL.
  * **Human-Readable Short IDs**: Quick lookups using numeric badges (e.g., `#1`, `#2`, `#3`) alongside UUID primary keys.
  * **Instant Filter Pills**: Categorize boards by *Architecture*, *Authentication*, *Database ERD*, or *Design Systems*.
  * **One-Click Actions**: Immediate canvas loading, direct high-resolution PNG export, and secure deletion.

---

### 4. Interactive NestJS Swagger OpenAPI 3.0 Documentation
Production API documentation explorer hosted at `/api/docs`, providing live testing, parameter definitions, and RFC-compliant JSON responses.

![Swagger OpenAPI 3.0 Documentation](frontend/public/swagger-api-docs.png)

* **Key Highlights**:
  * **Complete Endpoint Coverage**: Interactive definitions for `/api/drawings` (CRUD), `/api/drawings/upload-image` (Cloudinary multipart buffer), `/api/health` (diagnostics), and `/collaboration` (WebSockets).
  * **Strongly-Typed DTOs**: Strict request validation powered by `class-validator` and `class-transformer`.
  * **Uniform Response Envelopes**: Interceptor-standardized format `{ success, statusCode, data, timestamp }` on all endpoints.

---

### 5. Production End-to-End System Architecture Blueprint
Architectural diagram illustrating the separation of concerns across the Vercel Edge client tier, Render NestJS API gateway, Neon Serverless PostgreSQL, and Cloudinary media CDN.

![System Architecture Blueprint](frontend/public/system-architecture.png)

* **Key Highlights**:
  * **Decoupled Architecture**: Clean architectural boundaries between Client, Gateway, and Persistence layers.
  * **Network Protocols**: Encrypted communication utilizing HTTPS REST for API operations, WSS for WebSockets, and SSL connection pooling for database queries.
  * **Automated Self-Healing DB**: Automatic initialization of missing tables and indexes on backend startup via `ensureTablesExist()`.

---

## 📌 Executive Summary

**Whiteboard Studio** is an enterprise-grade digital whiteboard built to deliver high-performance visual brainstorming, diagramming, and multi-user collaboration. 

Designed following **Clean Architecture** principles:
* **Frontend**: Next.js 14 App Router, TypeScript, and a custom HTML5 2D Vector Canvas rendering pipeline that supports infinite zoom/pan, high-DPI scaling, 11 interactive tools, an undo/redo state engine, and real-time remote cursor projection.
* **Backend**: NestJS 10 modular micro-architecture with auto-generated Swagger OpenAPI docs, Prisma ORM connected to Neon Serverless PostgreSQL with SSL connection pooling, Cloudinary CDN asset pipelines, and a bi-directional WebSocket gateway for multi-user collaboration.

---

## 🌟 Key Features

### 🖌️ 1. High-Performance Graphics & Canvas Engine
* **11 Interactive Tools**: Freehand Pencil, Rectangle, Circle / Ellipse, Diamond, Arrow, Line, Text Annotation, Sticky Notes, Eraser, Selection / Move, and Hand (Pan).
* **Infinite Canvas & Transformations**: High-precision coordinate space projection converting viewport pixels to canvas world coordinates across infinite zoom ($0.2\times$ to $3.0\times$) and panning planes.
* **Retina High-DPI Scaling**: Pixel-perfect rendering matching `window.devicePixelRatio` with zero blurriness or distortion.
* **Interactive Element Manipulation**: Select, drag to reposition, duplicate (`Clone`), and delete any element directly on the canvas.
* **Undo / Redo History Stack**: Non-destructive Memento pattern state management with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
* **Live Radar Minimap**: Real-time floating minimap in the corner displaying the entire scene overview and current viewport bounding box.

### 👥 2. Real-Time Collaboration (WebSockets / Socket.IO)
* **Live Cursor Streaming**: Throttled 40Hz bi-directional broadcast of collaborator cursor coordinates with distinct user avatar colors and name tags.
* **Real-Time Element Synchronization**: Instant broadcast of newly created, modified, or deleted shapes to all room participants.
* **Live Presence Indicators**: Header status badge displaying active collaborators connected in real time.

### ☁️ 3. Cloud Persistence & Cloudinary CDN Integration
* **Dual Persistence Pipeline**:
  1. **Visual Snapshot**: Offscreen rasterization uploaded to **Cloudinary CDN** with automatic WebP/PNG optimization.
  2. **Vector Scene Storage**: Full JSON vector element tree saved to **Neon PostgreSQL** via **Prisma ORM**, allowing any board to be reloaded and edited anytime.
* **Cloud Gallery & Search**: Search drawings by title or numeric ID (e.g. `#1`, `#2`), filter by category pills (*Shapes, Annotations, Diagrams, Wireframes*), and load boards with 1 click.
* **Self-Healing Schema**: Automated `ensureTablesExist()` initialization in the NestJS backend to automatically create tables and indexes on first startup.

### 📦 4. Multi-Format Export Engine
* **Export as PNG**: High-resolution image export with custom background rendering.
* **Export as Vector SVG**: Mathematical vector serialization into clean XML `<svg>` markup.
* **Project JSON Interchange**: Export and import complete `.whiteboard.json` files for offline backups and cross-session editing.

### 🛡️ 5. Enterprise Observability & Resilience
* **System & DB Health Endpoint**: `/api/health` monitoring Neon PostgreSQL round-trip latency (ms), uptime, and memory consumption (`rss`, `heapUsed`).
* **Unified API Envelope**: Interceptors standardizing all HTTP responses into `{ success, statusCode, data, timestamp }`.
* **Centralized Exception Filter**: Global error filter returning clean RFC-compliant error payloads with server-side stack trace logging.
* **Interactive Swagger UI**: Interactive API testing dashboard at `/api/docs`.

---

## 📐 System Architecture

```mermaid
flowchart TD
    subgraph Client["🖥️ Frontend Client (Next.js 14 App Router)"]
        UI["shadcn/ui & Tailwind Interface<br/>(Toolbar, PropertyBar, Header, Modals)"]
        CanvasEngine["🎨 Interactive Canvas Engine<br/>(HTML5 2D Context, DPR Scaler, Vector Scene)"]
        StateHistory["⏱️ State & History Manager<br/>(Undo/Redo Stack, Zoom & Pan Transform)"]
        CollabOverlay["👥 Collaborator Cursors & Minimap<br/>(Live Pointer Projections & Radar View)"]
        ApiClient["📡 API Client (Fetch with typed DTOs)"]
        SocketClient["⚡ Socket.IO Client (/collaboration)"]
        
        UI <--> CanvasEngine
        CanvasEngine <--> StateHistory
        CanvasEngine <--> CollabOverlay
        UI <--> ApiClient
        CanvasEngine <--> SocketClient
    end

    subgraph Backend["⚙️ Backend Server (NestJS 10)"]
        Main["main.ts (CORS, ValidationPipe, Swagger /api/docs)"]
        
        subgraph InterceptorsFilters["🛡️ Cross-Cutting Architecture Layer"]
            ExFilter["AllExceptionsFilter (RFC Error Standards)"]
            LogInterceptor["LoggingInterceptor (Latency & Route Logging)"]
            TransInterceptor["TransformInterceptor (Uniform JSON Envelope)"]
        end

        DrawingsCtrl["DrawingsController & LegacyCompatController"]
        HealthCtrl["HealthController (Neon DB ping & memory checks)"]
        CollabGateway["CollaborationGateway (Socket.IO Rooms & Cursors)"]
        DrawingsSvc["DrawingsService (Business Logic & Seeding)"]
        PrismaSvc["PrismaService (ORM Client)"]
        CloudinarySvc["CloudinaryService (Upload & Asset Lifecycle)"]

        Main --> InterceptorsFilters
        InterceptorsFilters --> DrawingsCtrl & HealthCtrl & CollabGateway
        DrawingsCtrl --> DrawingsSvc
        DrawingsSvc --> PrismaSvc & CloudinarySvc
        HealthCtrl --> PrismaSvc
    end

    subgraph External["☁️ Managed Cloud Infrastructure"]
        NeonDB[("🐘 Neon PostgreSQL<br/>(Serverless Pooler with SSL)")]
        CloudinaryCDN[("🖼️ Cloudinary CDN<br/>(Optimized WebP/PNG Thumbnails)")]
    end

    ApiClient -- "HTTPS / JSON REST" --> DrawingsCtrl
    SocketClient <== "WSS / Bi-directional Events" ==> CollabGateway
    PrismaSvc -- "TCP / SSL (Port 5432)" --> NeonDB
    CloudinarySvc -- "HTTPS API" --> CloudinaryCDN
    Client -. "Image Load via CDN URL" .-> CloudinaryCDN
```

---

## 🛠️ Technology Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `14.2.x` | Server/Client components, SSR, and production bundling |
| **Language** | TypeScript | `5.6.x` | Strict type safety across client and server |
| **Styling & UI** | Tailwind CSS + shadcn/ui | `3.4.x` | Responsive design, dark/light themes, Radix primitives |
| **Icons & Notifications** | Lucide React + Sonner | `0.441.x` | Iconography and toast feedback system |
| **Backend Framework** | NestJS | `10.4.x` | Modular architecture, dependency injection, controllers |
| **Database ORM** | Prisma | `5.22.x` | Type-safe queries, migrations, and relationship handling |
| **Database Engine** | PostgreSQL (Neon DB) | Serverless v16 | Cloud-native pooled PostgreSQL with SSL encryption |
| **Real-Time Gateway** | Socket.IO | `4.7.x` | Low-latency WebSockets for multi-user collaboration |
| **Cloud Media Storage** | Cloudinary SDK | `2.5.x` | Image transformation, optimization, and CDN delivery |
| **API Documentation** | Swagger / OpenAPI | `7.4.x` | Interactive API documentation at `/api/docs` |
| **Validation** | class-validator / transformer | `0.14.x` | DTO validation and input sanitization |

---

## 🗄️ Database Architecture

The application persists drawings into **Neon PostgreSQL** via Prisma using the following schema:

```prisma
model Drawing {
  id                 String   @id @default(uuid())
  shortId            Int      @unique @default(autoincrement())
  title              String   @default("Untitled Board")
  description        String?
  category           String   @default("shape")
  imageUrl           String   @db.Text
  thumbnailUrl       String?  @db.Text
  cloudinaryPublicId String?
  elements           Json     @default("[]")
  appState           Json?
  isSample           Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([category])
  @@index([isSample])
  @@index([createdAt])
}
```

### ⚡ Optimization Strategy
* **`shortId` Unique Index**: Enables human-readable numeric lookup (e.g. search by `#1` or `#12`).
* **`category` & `isSample` Indexes**: Zero-latency filtering for gallery tabs and sample template loading.
* **`createdAt` Index**: Fast descending pagination for the "Latest Drawings" feed.
* **`pgbouncer` Connection Pooling**: Built-in support for Neon's connection pooler to prevent connection spikes under high traffic.

---

## 📡 API Specification

### REST Endpoints (`/api`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/drawings` | `CreateDrawingDto` | Uploads snapshot to Cloudinary and saves vector elements to Neon DB |
| `GET` | `/api/drawings` | Query (`category`, `search`, `page`, `limit`) | Paginated list of drawings with filtering and sorting |
| `GET` | `/api/drawings/:id` | — | Retrieves single drawing by UUID or numeric `shortId` |
| `PATCH` | `/api/drawings/:id` | `UpdateDrawingDto` | Updates drawing title, elements, or snapshot |
| `DELETE` | `/api/drawings/:id` | — | Deletes drawing and cleans up Cloudinary CDN asset |
| `GET` | `/api/drawings/latest` | — | Quick feed of the 12 most recent drawings |
| `GET` | `/api/drawings/sample` | — | Retrieves built-in template drawings |
| `POST` | `/api/drawings/seed-samples`| — | Seeds default architectural diagrams and sticky notes |
| `GET` | `/api/health` | — | System health check (PostgreSQL ping latency, memory) |
| `GET` | `/api/docs` | — | Interactive Swagger / OpenAPI documentation |

### WebSockets Events (`/collaboration`)

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, userName, userColor }` | Joins a collaborative drawing session |
| `room-users` | Server ➔ Client | `Array<UserPresence>` | Returns list of all active users in the room |
| `user-joined` | Server ➔ Client | `UserPresence` | Notifies room members of a new collaborator |
| `user-left` | Server ➔ Client | `{ socketId }` | Notifies room members when a user disconnects |
| `cursor-move` | Client ➔ Server | `{ roomId, x, y }` | Broadcasts user's live cursor position |
| `cursor-moved` | Server ➔ Client | `{ socketId, x, y, userName, userColor }` | Renders remote collaborator cursor on canvas |
| `element-update` | Client ➔ Server | `{ roomId, element, action }` | Broadcasts element creation, modification, or deletion |
| `element-updated`| Server ➔ Client | `{ element, action, fromSocketId }` | Live updates canvas elements for all peers |
| `canvas-clear` | Client ➔ Server | `{ roomId }` | Broadcasts canvas wipe to all room members |

---

## 📁 Project Directory Structure

```text
Whiteboard-App/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # PostgreSQL schema & connection configuration
│   │   └── seed.ts             # Sample drawings seeder
│   ├── src/
│   │   ├── collaboration/      # Socket.IO Real-Time WebSockets Gateway
│   │   │   ├── collaboration.gateway.ts
│   │   │   └── collaboration.module.ts
│   │   ├── common/             # Enterprise Interceptors & Filters
│   │   │   ├── filters/http-exception.filter.ts
│   │   │   ├── interceptors/logging.interceptor.ts
│   │   │   └── interceptors/transform.interceptor.ts
│   │   ├── health/             # System Health & DB Ping Endpoint
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   ├── cloudinary/         # Cloudinary CDN SDK Wrapper
│   │   │   ├── cloudinary.service.ts
│   │   │   └── cloudinary.module.ts
│   │   ├── drawings/           # Drawings CRUD Feature Module
│   │   │   ├── dto/            # Class-validator DTOs (create, update, query)
│   │   │   ├── drawings.controller.ts
│   │   │   ├── drawings.service.ts
│   │   │   └── drawings.module.ts
│   │   ├── prisma/             # Global Prisma Client Provider & Table Self-Healing
│   │   ├── app.controller.ts   # Root Health Endpoint (GET / & HEAD /)
│   │   ├── app.module.ts       # Root NestJS Module
│   │   └── main.ts             # App Bootstrap (Swagger, CORS, Pipes)
│   ├── .env.example            # Backend environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                 # Showcase screenshots, vector SVG assets
│   │   ├── hero-workspace.png
│   │   ├── realtime-collaboration.png
│   │   ├── cloud-gallery.png
│   │   ├── swagger-api-docs.png
│   │   └── system-architecture.png
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # CSS variables, grid lines & dot patterns
│   │   │   ├── layout.tsx      # Root layout, Inter font & Toaster
│   │   │   └── page.tsx        # Main Whiteboard application workspace
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components (Button, Dialog, Tabs, Dropdown...)
│   │   │   └── whiteboard/     # Whiteboard Canvas, Toolbar, PropertyBar, Header,
│   │   │                       # Minimap, CollaboratorCursors, ShortcutsModal, Gallery
│   │   ├── hooks/
│   │   │   └── useCollaboration.ts # WebSockets client hook
│   │   ├── services/api.ts     # Typed REST API Client
│   │   └── types/              # Universal TypeScript data interfaces
│   ├── .env.example            # Frontend environment template
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   ├── vercel.json
│   └── package.json
│
└── README.md                   # Complete Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* Free accounts on **Neon PostgreSQL** and **Cloudinary**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ramjanict/Whiteboard-App.git
cd Whiteboard-App
```

---

### Step 2: Backend Setup (NestJS + Prisma + PostgreSQL)

1. Navigate to `backend`:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=8080
   DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   CLOUDINARY_URL="cloudinary://<key>:<secret>@<cloud_name>"
   FRONTEND_URL="http://localhost:3000"
   ```

3. Push database schema to Neon:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Start the NestJS backend:
   ```bash
   npm run start:dev
   ```
   * **API Base URL**: `http://localhost:8080/api`
   * **Swagger API Documentation**: `http://localhost:8080/api/docs`
   * **Health Check**: `http://localhost:8080/api/health`

---

### Step 3: Frontend Setup (Next.js + TypeScript + Tailwind)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in `frontend/.env`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_WS_URL=http://localhost:8080/collaboration
   ```

3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
   * **Frontend Web Application**: `http://localhost:3000`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Category | Action |
| :---: | :--- | :--- |
| `H` | Tools | **Hand tool** (Pan canvas) |
| `V` | Tools | **Selection tool** (Select, move, clone elements) |
| `P` | Tools | **Freehand Pencil** |
| `R` | Tools | **Rectangle tool** |
| `C` | Tools | **Circle / Ellipse tool** |
| `D` | Tools | **Diamond tool** |
| `A` | Tools | **Arrow tool** |
| `L` | Tools | **Straight Line tool** |
| `T` | Tools | **Text Annotation tool** |
| `S` | Tools | **Sticky Note tool** |
| `E` | Tools | **Eraser tool** |
| `Ctrl + Z` | History | **Undo** last action |
| `Ctrl + Y` | History | **Redo** action |
| `Ctrl + S` | Cloud | **Save to Cloud** (Neon DB + Cloudinary) |
| `Delete` / `Backspace` | Actions | **Delete** selected element |
| `Ctrl + Mouse Wheel` | Viewport | **Zoom in / out** centered on cursor |
| `Space + Drag` | Navigation | **Quick pan** across canvas |
| `?` | Help | Open **Shortcuts Reference Dialog** |

---

## 👨‍💻 Engineering Profile & Contact

**Md Ramjan Ali**  
*Full-Stack Software Engineer*  

* **Live Demo (Frontend)**: [https://yourwhiteboard.vercel.app/](https://yourwhiteboard.vercel.app/)
* **Live API (Backend)**: [https://whiteboard-studio-c21b.onrender.com/](https://whiteboard-studio-c21b.onrender.com/)
* **Swagger API Docs**: [https://whiteboard-studio-c21b.onrender.com/api/docs](https://whiteboard-studio-c21b.onrender.com/api/docs)
* **GitHub**: [@Ramjanict](https://github.com/Ramjanict)  
* **Email**: [mdramjan.ict@gmail.com](mailto:mdramjan.ict@gmail.com)  
* **Project Repository**: [https://github.com/Ramjanict/Whiteboard-App](https://github.com/Ramjanict/Whiteboard-App)  

---

<div align="center">
  <sub>Engineered with precision for modern engineering teams. If you find this project valuable, please star ⭐ the repository!</sub>
</div>
