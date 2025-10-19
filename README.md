# 3D Model Viewer

A collaborative 3D model viewer where users can view STL files, leave chat messages, add annotations to 3D models, and share camera positions in real-time.

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, shadcn/ui, React Three Fiber
- **Backend**: NestJS v11 with tRPC
- **Database**: MongoDB (project documents with STL files, chat logs, annotations, camera positions)
- **API Layer**: tRPC for type-safe communication
- **Real-time**: Socket.IO for WebSocket subscriptions
- **Validation**: Zod
- **Infrastructure**: Docker Compose
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd 3d-model-view
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

3. Start services with Docker Compose
```bash
# From root directory
docker-compose up
```

This will start:
- MongoDB on port 27017
- Backend server on port 3001
- Frontend server on port 3000

### Development Commands

#### Backend (from `backend/` directory)

```bash
pnpm run start:dev       # Development with hot reload
pnpm run build           # Production build
pnpm run start:prod      # Run production build
pnpm run test            # Unit tests
pnpm run test:e2e        # End-to-end tests
pnpm run lint            # ESLint with auto-fix
```

#### Frontend (from `frontend/` directory)

```bash
pnpm run dev             # Development server
pnpm run build           # Production build
pnpm run start           # Run production build
pnpm run lint            # ESLint
```

## Architecture

### Frontend Structure

- **Framework**: Next.js with App Router
- **UI Components**: shadcn/ui components
- **3D Rendering**: React Three Fiber for STL model viewing
- **Key Pages**:
  - `/login` - Name-only authentication
  - `/projects` - List all projects
  - `/project/[id]` - Project viewer with 3D scene and chat sidebar

### Backend Structure

- **Framework**: NestJS with module-based architecture
- **API**: tRPC routers integrated via nestjs-trpc
- **Database**: MongoDB with project documents
- **Real-time**: Socket.IO WebSocket gateway for subscriptions
- **Entry Point**: `backend/src/main.ts` - Server runs on port 3001

### MongoDB Document Schema

Each project is stored as a document with:
```typescript
{
  projectId: string;
  projectName: string;
  stlFile?: string;  // Binary STL file data
  chatLog: Array<{
    userId: string;
    message: string;
    timestamp: Date;
  }>;
  annotations: Array<{
    text: string;
    userId: string;
    vertex: { x: number; y: number; z: number };
    timestamp: Date;
  }>;
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Real-time Collaboration

### WebSocket System

The application uses Socket.IO for real-time updates across all collaborative features (chat, annotations, camera positions, STL uploads).

#### Architecture Overview

**Backend Components:**

1. **`EventsService`** (`backend/src/services/events.service.ts`)
   - **Purpose**: Event emitter for broadcasting project updates
   - **Type**: Singleton service shared across modules
   - **Methods**:
     - `emitProjectUpdate(event)` - Emit a project update event
     - `onProjectUpdate(callback)` - Subscribe to project updates

2. **`ProjectGateway`** (`backend/src/gateways/project.gateway.ts`)
   - **Purpose**: WebSocket gateway using Socket.IO
   - **Features**:
     - Listens to EventsService for project updates
     - Manages project-specific rooms
     - Broadcasts updates to subscribed clients
   - **Events**:
     - `subscribeToProject` - Client joins a project room
     - `unsubscribeFromProject` - Client leaves a project room
     - `projectUpdate` - Server broadcasts to clients

3. **`ProjectService`** (`backend/src/services/project.service.ts`)
   - **Purpose**: Business logic for project operations
   - **Integration**: Emits events via EventsService after mutations
   - **Triggers**: Chat messages, annotations, camera updates, STL uploads

**Frontend Components:**

1. **`useProjectSubscription`** (`frontend/lib/hooks/useProjectSubscription.ts`)
   - **Purpose**: WebSocket subscription hook
   - **Features**:
     - Connects to Socket.IO server
     - Joins project room
     - Listens for `projectUpdate` events
     - Invalidates tRPC queries to refetch data
   - **Optional callbacks**: `onCameraUpdate` for specific event handling

2. **`useCameraUpdate`** (`frontend/lib/hooks/useCameraUpdate.ts`)
   - **Purpose**: Debounced camera position updates
   - **Features**:
     - 500ms debounce to reduce server requests
     - Optimistic local updates
     - Error handling with rollback

#### Data Flow

**Flow for any project update (chat/annotation/camera/STL):**

```
User Action (chat/annotation/camera/STL)
  → tRPC Mutation
    → ProjectService method
      → Updates MongoDB
        → EventsService.emitProjectUpdate()
          → ProjectGateway receives event
            → Broadcasts to Socket.IO clients in project room
              → Frontend receives update
                → Invalidates tRPC query
                  → Refetches fresh data from backend
```

### tRPC Routes

- `user.create` - Create user from name, returns userId
- `projects.list` - Get all projects
- `projects.get` - Get single project by ID
- `projects.create` - Create new project
- `projects.uploadSTL` - Upload STL file to project
- `projects.addChatMessage` - Add message to chat log
- `projects.addAnnotation` - Add annotation to 3D model
- `projects.updateCamera` - Update camera position/rotation

### WebSocket Events

- **Client → Server**:
  - `subscribeToProject` - Join a project room
  - `unsubscribeFromProject` - Leave a project room

- **Server → Client**:
  - `projectUpdate` - Broadcast when project data changes
    ```typescript
    {
      projectId: string;
      type: 'chat' | 'annotation' | 'camera' | 'stl';
      timestamp: Date;
    }
    ```

## Project Structure

```
3d-model-view/
├── backend/
│   ├── src/
│   │   ├── controllers/      # HTTP controllers
│   │   ├── gateways/         # WebSocket gateways
│   │   │   └── project.gateway.ts
│   │   ├── schemas/          # MongoDB schemas
│   │   ├── services/         # Business logic
│   │   │   ├── events.service.ts
│   │   │   ├── project.service.ts
│   │   │   └── user.service.ts
│   │   ├── trpc/             # tRPC routers
│   │   │   ├── trpc.module.ts
│   │   │   ├── trpc.router.ts
│   │   │   └── trpc.schemas.ts
│   │   └── main.ts
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── project/[id]/
│   │   │   ├── components/
│   │   │   │   ├── CameraController.tsx
│   │   │   │   ├── ThreeScene.tsx
│   │   │   │   └── Chat.tsx
│   │   │   └── page.tsx
│   │   └── projects/
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── useCameraUpdate.ts
│   │   │   ├── useProjectData.ts
│   │   │   └── useProjectSubscription.ts
│   │   └── trpc/
│   │       ├── client.ts
│   │       └── Provider.tsx
│   └── package.json
└── docker-compose.yml
```
