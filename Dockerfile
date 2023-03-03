FROM node:14.21.2-bullseye
#ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "webpack.config.js", "./"]

RUN npm install

COPY . .

CMD [ "npm", "start" ]