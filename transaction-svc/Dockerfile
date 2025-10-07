# ---------- Etapa 1: dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Etapa 2: build + prisma generate ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Genera el cliente de Prisma (crea node_modules/@prisma y node_modules/.prisma)
RUN npx prisma generate
RUN npm run build

# ---------- Etapa 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

# Copiar build
COPY --from=builder /app/dist ./dist

# 👇 Copiamos artefactos generados por Prisma al runner
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 👇 opcional, por si quieres tener el schema a mano
COPY --from=builder /app/prisma ./prisma

# Usa db push si no tienes migraciones, o migrate deploy si sí
CMD sh -c "npx prisma db push && node dist/main"
# CMD sh -c "npx prisma migrate deploy && node dist/main"
