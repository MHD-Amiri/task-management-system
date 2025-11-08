FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared libraries first
COPY shared ./shared

# Build shared libraries
WORKDIR /app/shared/socket-io
RUN npm install && npm run build

WORKDIR /app/shared/communication
RUN npm install && npm run build

# Copy scheduler service files
WORKDIR /app/scheduler-service
COPY scheduler-service/package*.json ./
COPY scheduler-service/tsconfig*.json ./
COPY scheduler-service/nest-cli.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY scheduler-service/src ./src

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# install the client tools we use in the startup wait loop
RUN apk add --no-cache postgresql-client redis

# Copy shared libraries
COPY --from=builder /app/shared ./shared

# Copy scheduler service package files
COPY scheduler-service/package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application
COPY --from=builder /app/scheduler-service/dist ./dist

EXPOSE 3002

CMD ["node", "dist/main"]

