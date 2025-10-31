FROM node:22.12.0-alpine

WORKDIR /app

ADD package*.json ./
RUN npm ci

ADD src ./src
ADD tsconfig.json .
# ADD .env .

ENV PORT=3000
EXPOSE ${PORT}

CMD ["npm", "run", "dev"]