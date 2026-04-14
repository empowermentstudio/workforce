FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm install --production

COPY server/ ./
COPY frontend/ ./public/

RUN mkdir -p /data

EXPOSE 10000

CMD ["node", "index.js"]
