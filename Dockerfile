FROM node:20-alpine AS web-builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY public ./public
COPY next.config.js tsconfig.json tailwind.config.ts postcss.config.js next-env.d.ts ./
RUN npm run build

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8000
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libglib2.0-0 libgomp1 && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend ./backend
COPY --from=web-builder /app/.next/standalone ./web
COPY --from=web-builder /app/.next/static ./web/.next/static
COPY --from=web-builder /app/public ./web/public
COPY docker-start.sh ./docker-start.sh
RUN chmod +x ./docker-start.sh
EXPOSE 3000 8000
CMD ["./docker-start.sh"]
