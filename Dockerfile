# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install required packages for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Development image (larger but with dev dependencies)
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables
ENV NODE_ENV=development

# Start the app in development mode (port 3000)
CMD ["npm", "run", "dev"]

# Production build image
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Production image (smaller without dev dependencies)
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Install required packages for Prisma in production
RUN apk add --no-cache openssl libc6-compat

# Copy only necessary files from the build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Run Prisma setup script first (if needed)
# Uncomment if you want to run migrations on container start
# CMD ["sh", "-c", "node scripts/prisma-setup.js && node server.js"]

# Start the Node.js server
CMD ["node", "server.js"]
