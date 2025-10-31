
FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:24-alpine

WORKDIR /app
COPY --from=build /app/package*.json ./
ARG NODE_ENV=production
RUN npm ci --only=production

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV ALLOWED_ORIGINS=http://localhost
ENV PORT=3000

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
