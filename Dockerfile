FROM node:lts-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production

COPY . .

USER 33

EXPOSE 3000
CMD [ "npm", "start" ]
