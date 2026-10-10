FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma7.config.ts ./

RUN npm ci

COPY . .

RUN npx prisma generate --config prisma7.config.ts
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

CMD ["node", "dist/main.js"]
