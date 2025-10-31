FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG NODE_ENV=production
ARG VITE_API_BASE_URL=http://localhost:3000

ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /var/www/html/
RUN chown -R nginx:nginx /var/www/html

ENV PORT=5000
EXPOSE ${PORT}

COPY ./nginx.prod.conf.template /etc/nginx/conf.d/default.conf.template
RUN envsubst '\${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/default.conf.template

ENTRYPOINT ["nginx","-g","daemon off;"]