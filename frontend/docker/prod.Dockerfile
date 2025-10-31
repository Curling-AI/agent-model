FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG NODE_ENV=production
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ARG VITE_SUPABASE_STORAGE_NAME

ARG VITE_FACEBOOK_APP_ID
ARG VITE_FACEBOOK_APP_SECRET
ARG VITE_FACEBOOK_GRAPH_API_VERSION
ARG VITE_FACEBOOK_CONFIGURATION_ID
ARG VITE_FACEBOOK_FEATURE_TYPE
ARG VITE_FACEBOOK_URL

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