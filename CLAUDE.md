# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collaborative 3D model viewer where users can view STL files, leave chat messages, add annotations to 3D models, and share camera positions in real-time. Users authenticate with just a name (backend generates user IDs), view project lists, and interact with 3D models in a shared workspace.

## Tech Stack

- **Frontend**: Next.js with TypeScript, shadcn/ui, React Three Fiber
- **Backend**: NestJS v11 with tRPC
- **Database**: MongoDB (project documents with STL files, chat logs, annotations, camera positions)
- **API Layer**: tRPC for type-safe communication
- **Validation**: Zod
- **Infrastructure**: Docker Compose
- **Package Manager**: pnpm

## Development Commands

### Root Level

```bash
# Start all services (MongoDB, backend, frontend)
docker-compose up

# Stop all services
docker-compose down
```

### Backend (from `backend/` directory)

```bash
# Install dependencies
pnpm install

# Development with hot reload
pnpm run start:dev

# Production build and run
pnpm run build
pnpm run start:prod

# Testing
pnpm run test              # Unit tests
pnpm run test:watch        # Watch mode
pnpm run test:e2e          # End-to-end tests
pnpm run test:cov          # Coverage report

# Code quality
pnpm run lint              # ESLint with auto-fix
pnpm run format            # Prettier formatting
```

### Frontend (from `frontend/` directory)

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Production build and start
pnpm run build
pnpm run start

# Linting
pnpm run lint
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
- **Entry Point**: `backend/src/main.ts` - Server runs on port 3000
- **Real-time Updates**: When changes occur, backend notifies clients to fetch updates

### MongoDB Document Schema

Each project is stored as a document with:
- `stlFile`: Binary STL file data
- `chatLog`: Array of `{ userId: string, message: string, timestamp: Date }`
- `annotations`: Array of `{ text: string, userId: string, vertex: { x: number, y: number, z: number }, timestamp: Date }`
- `camera`: Object with `{ position: { x, y, z }, rotation: { x, y, z } }`
- `projectId`: Unique identifier
- `title`: Display name
- `createdAt`, `updatedAt`: Timestamps

### Data Flow

1. User logs in with name → Backend creates user ID → Returns to frontend
2. User selects project → Fetch project document from MongoDB
3. Frontend renders:
   - React Three Fiber canvas with STL model
   - Chat sidebar on the left
   - Annotations overlaid on 3D model
4. Auto-save on changes (camera movement, chat messages, annotations)
5. Backend broadcasts change notifications → Clients fetch latest data

### tRPC Routes

- `user.create` - Create user from name, returns userId
- `projects.list` - Get all projects
- `projects.get` - Get single project by ID
- `projects.create` - Create new project
- `projects.uploadSTL` - Upload STL file to project
- `projects.addChatMessage` - Add message to chat log
- `projects.addAnnotation` - Add annotation to 3D model
- `projects.updateCamera` - Update camera position/rotation

## TypeScript Configuration

- **Backend**: NodeNext module resolution, ES2023 target, decorators enabled
- **Frontend**: Standard Next.js TypeScript configuration

## Docker Setup

Docker Compose orchestrates:
- MongoDB service
- Backend service (NestJS)
- Frontend service (Next.js)
