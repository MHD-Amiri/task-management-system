FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared libraries first
COPY shared ./shared

# Build shared libraries
WORKDIR /app/shared/socket-io
RUN npm install && npm run build

WORKDIR /app/shared/communication
RUN npm install && npm run build

# Copy task service files
WORKDIR /app/task-service
COPY task-service/package*.json ./
COPY task-service/tsconfig*.json ./
COPY task-service/nest-cli.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY task-service/src ./src

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# install the client tools we use in the startup wait loop
RUN apk add --no-cache postgresql-client redis

# Copy shared libraries
COPY --from=builder /app/shared ./shared

# Copy task service package files
COPY task-service/package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application
COPY --from=builder /app/task-service/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3001

CMD ["node", "dist/main"]

