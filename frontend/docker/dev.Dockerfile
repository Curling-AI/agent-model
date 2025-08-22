# Dockerfile para aplicação React + Vite
FROM node:22.12.0-alpine

WORKDIR /app

ADD package*.json ./
RUN npm ci

ADD ./src ./src
ADD ./public ./public
ADD ./tsconfig.json .
ADD ./.env .

EXPOSE 5000

CMD ["npm", "run", "dev"]