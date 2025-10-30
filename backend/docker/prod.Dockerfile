FROM node:22.12.0-alpine

WORKDIR /app

ADD package*.json ./
RUN npm ci

ADD src ./src
ADD tsconfig.json .

EXPOSE 3000

CMD ["npm", "run", "dev"]