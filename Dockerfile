FROM node:buster as BUILDER

WORKDIR /app
COPY . .
RUN apt update && apt install -y git
RUN yarn install
RUN yarn build || true

# --------------------------------------------------
FROM nginx

COPY --from=BUILDER /app/dist /usr/share/nginx/html

EXPOSE 80
