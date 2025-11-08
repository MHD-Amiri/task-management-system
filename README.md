# Task Management System - Microservices Architecture

A comprehensive microservices-based Task Management System built with Nest.js, demonstrating clean architecture, SOLID principles, repository pattern, configurable inter-service communication, real-time features via Socket.IO, API versioning, and file upload capabilities.

## Architecture Overview

The system consists of two independent Nest.js microservices:

1. **Task Service** - Handles task CRUD operations, file uploads, and broadcasts real-time events
2. **Scheduler Service** - Manages job scheduling and execution, receives events from Task Service

### Key Features

- ✅ **Clean Architecture** - Clear separation of concerns (Controller/Service/Repository)
- ✅ **SOLID Principles** - Applied throughout the codebase
- ✅ **Repository Pattern** - Abstracted data access layer
- ✅ **Strategy Pattern** - Configurable inter-service communication (HTTP, Socket.IO, Redis)
- ✅ **API Versioning** - Support for v1 and v2 APIs simultaneously (URL or Header-based)
- ✅ **Real-time Events** - Socket.IO for broadcasting events
- ✅ **File Upload** - Image and PDF file attachments for tasks
- ✅ **Dockerized** - Fully containerized with docker-compose
- ✅ **TypeORM** - Database ORM with PostgreSQL

## Project Structure

```
.
├── shared/
│   ├── socket-io/          # Shared Socket.IO library
│   └── communication/      # Shared communication interfaces and strategies
├── task-service/           # Task Management Service
│   ├── src/
│   │   ├── task/          # Task module (CRUD)
│   │   ├── file/          # File upload module
│   │   ├── communication/ # Event publishing
│   │   ├── socket/        # Socket.IO gateway
│   │   └── versioning/    # API versioning
│   └── Dockerfile
├── scheduler-service/      # Job Scheduler Service
│   ├── src/
│   │   ├── schedule/      # Schedule/job management
│   │   ├── event-listener/# Event reception
│   │   └── socket/        # Socket.IO gateway
│   └── Dockerfile
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)

## Quick Start

1. **Clone the repository** (if applicable)

2. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Start all services**:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database
   - Redis
   - Task Service (port 3001)
   - Scheduler Service (port 3002)

4. **Verify services are running**:
   - Task Service: http://localhost:3001
   - Scheduler Service: http://localhost:3002

## Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=taskdb

# Communication Mode (http, socketio, redis)
COMMUNICATION_MODE=http

# API Versioning Strategy (url, header)
API_VERSIONING_STRATEGY=url
```

## API Documentation

### Health Checks

Both services expose health check endpoints:

**Task Service Health**
```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/ready
```

**Scheduler Service Health**
```bash
curl http://localhost:3002/health
curl http://localhost:3002/health/ready
```

### Task Service

#### V1 API (URL-based)

**Create Task**
```bash
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the microservices project",
    "status": "pending"
  }'
```

**Get All Tasks**
```bash
curl http://localhost:3001/api/v1/tasks
```

**Get Task by ID**
```bash
curl http://localhost:3001/api/v1/tasks/{taskId}
```

**Update Task**
```bash
curl -X PUT http://localhost:3001/api/v1/tasks/{taskId} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "status": "in_progress"
  }'
```

**Delete Task**
```bash
curl -X DELETE http://localhost:3001/api/v1/tasks/{taskId}
```

**Upload File**
```bash
curl -X POST http://localhost:3001/api/v1/tasks/{taskId}/upload \
  -F "file=@/path/to/file.pdf"
```

#### V2 API (Enhanced Response)

V2 API provides additional fields:
- `statusLabel` - Human-readable status
- `attachmentCount` - Number of attachments
- `metadata` - Additional metadata object

**Example V2 Request**
```bash
curl http://localhost:3001/api/v2/tasks
```

**Header-based Versioning**

When `API_VERSIONING_STRATEGY=header`, use:
```bash
curl http://localhost:3001/api/tasks \
  -H "X-API-Version: 2"
```

### Scheduler Service

**Get All Schedules**
```bash
curl http://localhost:3002/api/v1/schedules
```

**Create Schedule**
```bash
curl -X POST http://localhost:3002/api/v1/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-uuid",
    "scheduledAt": "2024-12-31T12:00:00Z"
  }'
```

**Execute Job**
```bash
curl -X POST http://localhost:3002/api/v1/schedules/{scheduleId}/execute
```

**Get Schedules by Task ID**
```bash
curl http://localhost:3002/api/v1/schedules/task/{taskId}
```

## Communication Modes

The system supports three communication modes between Task Service and Scheduler Service:

### 1. HTTP (Default)

Set `COMMUNICATION_MODE=http` in `.env`

Task Service sends events via HTTP POST to Scheduler Service's `/api/v1/events/task` endpoint.

### 2. Socket.IO

Set `COMMUNICATION_MODE=socketio` in `.env`

Task Service connects to Scheduler Service via Socket.IO and emits `task.event` events.

### 3. Redis Pub/Sub

Set `COMMUNICATION_MODE=redis` in `.env`

Task Service publishes events to Redis channel `task-events`, and Scheduler Service subscribes to receive them.

**Switching Communication Modes**

Simply change `COMMUNICATION_MODE` in `.env` and restart services:
```bash
docker-compose restart task-service scheduler-service
```

## Real-time Events (Socket.IO)

Both services emit real-time events via Socket.IO. Connect to receive events:

**Task Service Events:**
- `task.created` - New task created
- `task.updated` - Task updated
- `task.deleted` - Task deleted
- `task.file.uploaded` - File uploaded to task

**Scheduler Service Events:**
- `job.created` - New job scheduled
- `job.executed` - Job execution started
- `job.completed` - Job completed successfully
- `job.failed` - Job execution failed

**Example Client Connection:**
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('task.created', (data) => {
  console.log('New task created:', data);
});
```

## File Upload

- **Endpoint**: `POST /api/v1/tasks/:id/upload`
- **Allowed Types**: Images (`image/*`) and PDFs (`application/pdf`)
- **Max Size**: 10MB
- **Storage**: Files saved in `task-service/uploads/` directory

**Example:**
```bash
curl -X POST http://localhost:3001/api/v1/tasks/{taskId}/upload \
  -F "file=@document.pdf"
```

## Saga Orchestration

The system implements a simple saga pattern for distributed transactions between Task Service and Scheduler Service:

1. **Task Creation Saga:**
   - Task Service creates a task
   - Publishes `task.created` event
   - Scheduler Service receives event and auto-creates a scheduled job
   - If job creation fails, the saga can be compensated (future enhancement)

2. **Task Update Saga:**
   - Task Service updates a task
   - Publishes `task.updated` event
   - Scheduler Service updates related schedules if needed

3. **Task Deletion Saga:**
   - Task Service deletes a task
   - Publishes `task.deleted` event
   - Scheduler Service cancels related schedules

The current implementation uses event-driven communication. For more complex scenarios, a full saga orchestrator (like Temporal or a custom orchestrator) can be integrated.

## Design Decisions

### 1. Repository Pattern
- Abstracts data access layer
- Allows swapping ORMs (TypeORM, Prisma, etc.) without changing business logic
- Follows Dependency Inversion Principle

### 2. Strategy Pattern for Communication
- Enables runtime configuration of communication method
- Easy to add new communication strategies (Kafka, RabbitMQ, etc.)
- Follows Open/Closed Principle

### 3. API Versioning
- Supports both URL and header-based versioning
- Allows gradual migration from v1 to v2
- Maintains backward compatibility

### 4. Shared Libraries
- Socket.IO and communication interfaces shared between services
- Reduces code duplication (DRY principle)
- Ensures consistency

### 5. Clean Architecture
- Clear layer separation: Controller → Service → Repository
- Business logic independent of framework
- Easy to test and maintain

## Testing

Run unit tests:
```bash
cd task-service
npm test

cd scheduler-service
npm test
```

Run with coverage:
```bash
npm run test:cov
```

## Development

### Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   cd task-service && npm install
   cd ../scheduler-service && npm install
   cd ../shared/socket-io && npm install
   cd ../shared/communication && npm install
   ```

2. **Start PostgreSQL and Redis** (via Docker or locally)

3. **Run services:**
   ```bash
   # Terminal 1
   cd task-service
   npm run start:dev

   # Terminal 2
   cd scheduler-service
   npm run start:dev
   ```

### Building Shared Libraries

```bash
cd shared/socket-io
npm run build

cd ../communication
npm run build
```

## Database Schema

### Tasks Table
- `id` (UUID)
- `title` (string)
- `description` (text, nullable)
- `status` (enum: pending, in_progress, completed, cancelled)
- `createdAt`, `updatedAt` (timestamps)

### File Attachments Table
- `id` (UUID)
- `taskId` (UUID, foreign key)
- `fileName`, `originalName` (string)
- `mimeType` (string)
- `size` (bigint)
- `path` (string)
- `uploadedAt` (timestamp)

### Schedules Table
- `id` (UUID)
- `taskId` (string)
- `scheduledAt` (timestamp)
- `status` (enum: pending, scheduled, running, completed, failed, cancelled)
- `result`, `error` (text, nullable)
- `executedAt`, `completedAt` (timestamp, nullable)
- `createdAt`, `updatedAt` (timestamps)

## Troubleshooting

### Services won't start
- Check if ports 3001, 3002, 5432, 6379 are available
- Verify Docker and Docker Compose are running
- Check logs: `docker-compose logs task-service`

### Database connection errors
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database credentials in `.env`

### Communication not working
- Verify `COMMUNICATION_MODE` is set correctly
- Check service logs for connection errors
- For Redis: ensure Redis container is running

## Future Enhancements

- [ ] Kafka/RabbitMQ communication strategy
- [ ] Swagger/OpenAPI documentation
- [x] Health check endpoints
- [x] Multi-stage Docker builds for smaller images
- [ ] Configurable ORM (Postgres/Mongo/SQLite)
- [x] Saga orchestration for distributed transactions (basic implementation)
- [ ] Centralized logging (ELK stack)
- [ ] Metrics and monitoring (Prometheus)
- [ ] Full saga orchestrator with compensation
- [ ] Rate limiting and API throttling
- [ ] Authentication and authorization (JWT)

## License

MIT

## Author

Built as a demonstration of microservices architecture, clean code principles, and Nest.js best practices.

