# 3D Model Viewer

A collaborative 3D model viewer where users can view STL files, leave chat messages, add annotations to 3D models, and share camera positions in real-time.

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, shadcn/ui, React Three Fiber, Lucide React icons
- **Backend**: NestJS v11 with tRPC
- **Database**: MongoDB (project documents with STL files, chat logs, annotations, camera positions, user profiles)
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
- **3D Rendering**: React Three Fiber for STL model viewing with PivotControls for model transformation
- **Mode System**: Context-based mode switching between Transform and Note modes

- `/projects` - List all projects
- `/project/[id]` - Project viewer with 3D scene and chat sidebar

### Backend Structure

- **Framework**: NestJS with module-based architecture
- **API**: tRPC routers integrated via nestjs-trpc
- **Database**: MongoDB with project documents
- **Real-time**: Socket.IO WebSocket gateway for subscriptions
- **Entry Point**: `backend/src/main.ts` - Server runs on port 3001

### MongoDB Document Schemas

#### Project Schema

Each project is stored as a document with:
```typescript
{
  projectId: string;
  title: string;
  stlFile?: string;  // Binary STL file data
  chatLog: Array<{
    userId: string;
    userName?: string;  // Populated from User collection
    message: string;
    timestamp: Date;
  }>;
  annotations: Array<{
    text: string;
    userId: string;
    userName?: string;  // Populated from User collection
    vertex: { x: number; y: number; z: number };
    timestamp: Date;
  }>;
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
  modelTransform: {
    origin: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### User Schema

Each user is stored as a document with:
```typescript
{
  userId: string;      // Unique identifier
  name: string;        // Display name (custom or auto-generated)
  createdAt: Date;
  updatedAt: Date;
}
```

## Features

### User Identification System

The application implements a persistent user identification system for collaborative features:

**User ID Generation:**
- Backend generates unique `userId` when client first connects via WebSocket
- `userId` is stored in browser's localStorage for persistence across sessions
- Automatic reconnection using existing `userId` on subsequent visits

**User Name Management:**
- Modal appears on first visit prompting for a display name
- Users can enter custom name or skip to auto-generate a random name
- Random names generated using `unique-names-generator` (e.g., "Brave Red Tiger")
- User names stored in MongoDB and associated with `userId`
- Names displayed in chat messages and annotations instead of raw user IDs

**Event Filtering:**
- Backend tracks which user triggered each update (chat, camera, transformations)
- Users only elaborate on events when not in background (doesn't annoy user on main window)

**Implementation:**
- `UserGateway`: WebSocket gateway for user identification and name registration
- `UserContext`: React context providing `userId` and `userName` globally
- `UserNameModal`: Dialog component for name input with auto-generation option
- `UserService`: MongoDB operations for creating/updating user profiles
- Stored in localStorage: `3d-model-viewer-user-id` and `3d-model-viewer-user-name`

### 3D Model Transformation

The application supports interactive 3D model transformation with persistent storage:

- **Transform Controls**: PivotControls from `@react-three/drei` provide intuitive gizmos for manipulating models
- **Transformations**: Origin (position), scale, and rotation are stored per-project
- **Mode System**:
  - **Transform Mode**: Shows PivotControls gizmo for moving/scaling the model
  - **Note Mode**: Hides transform controls and shows nearest vertex indicator for annotations
- **Real-time Updates**: Model transformations are saved to MongoDB and broadcast to all collaborators
- **Debounced Updates**: 500ms debounce prevents excessive server requests during manipulation

**Implementation Details:**

- `ModelTransformController`: Wraps the 3D model and manages PivotControls based on current mode
- `useModelTransformUpdate`: Hook for debounced transformation updates with optimistic UI
- `useGeometryVertex`: Calculates vertex positions accounting for model transformations
- `useMouseNearbyVertices`: Finds nearest vertex to mouse cursor in world space

### Annotation System

- **Vertex Detection**: Hover over the model to highlight nearby vertices
- **Mode-based UI**: Vertex indicators only visible in Note mode to avoid clutter during transformations
- **World Space Calculation**: Vertex positions correctly account for model transformations

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
- `projects.get` - Get single project by ID (includes populated userNames)
- `projects.create` - Create new project
- `projects.uploadSTL` - Upload STL file to project (includes userId)
- `projects.addChatMessage` - Add message to chat log (includes userId)
- `projects.addAnnotation` - Add annotation to 3D model (includes userId)
- `projects.updateCamera` - Update camera position/rotation (includes userId)
- `projects.updateModelTransform` - Update model origin, scale, and rotation (includes userId)

### WebSocket Events

- **Client → Server**:
  - `subscribeToProject` - Join a project room (includes userId for filtering)
  - `unsubscribeFromProject` - Leave a project room
  - `setUserName` - Register or update user's display name

- **Server → Client**:
  - `userId` - Server assigns userId to client on connection
  - `projectUpdate` - Broadcast when project data changes (filtered by userId)
    ```typescript
    {
      projectId: string;
      type: 'chat' | 'annotation' | 'camera' | 'stl' | 'modelTransform';
      timestamp: Date;
      userId?: string;  // User who triggered the update (for filtering)
    }
    ```

## Project Structure

```
3d-model-view/
├── backend/
│   ├── src/
│   │   ├── controllers/      # HTTP controllers
│   │   ├── gateways/         # WebSocket gateways
│   │   │   ├── project.gateway.ts
│   │   │   └── user.gateway.ts
│   │   ├── schemas/          # MongoDB schemas
│   │   │   ├── project.schema.ts
│   │   │   └── user.schema.ts
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
│   │   │   │   ├── Chat.tsx
│   │   │   │   ├── ChatToggleButton.tsx
│   │   │   │   ├── Commands.tsx
│   │   │   │   ├── ModelTransformController.tsx
│   │   │   │   ├── STLDropzone.tsx
│   │   │   │   ├── STLModel.tsx
│   │   │   │   └── ThreeScene.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCameraUpdate.ts
│   │   │   │   ├── useChatMessage.ts
│   │   │   │   ├── useConvertBinaryIntoGeometry.ts
│   │   │   │   ├── useGeometryVertex.ts
│   │   │   │   ├── useModelTransformUpdate.ts
│   │   │   │   └── useMouseNearbyVertices.ts
│   │   │   └── page.tsx
│   │   └── projects/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   └── UserNameModal.tsx
│   ├── lib/
│   │   ├── constants.ts             # Shared constants (Socket URL, storage keys)
│   │   ├── context/
│   │   │   ├── UserIdContext.tsx    # User identification context
│   │   │   └── useModes.tsx         # Mode context (Transform/Note)
│   │   ├── hooks/
│   │   │   ├── useProjectData.ts
│   │   │   └── useProjectSubscription.ts
│   │   └── trpc/
│   │       ├── client.ts
│   │       └── Provider.tsx
│   └── package.json
└── docker-compose.yml
```
