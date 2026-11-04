FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:cli

ENTRYPOINT ["node", "bin/saphene.js"]
CMD ["help"]
