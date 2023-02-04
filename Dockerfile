FROM node:16.15.0

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

RUN npm install pm2 -g

CMD ["pm2-runtime", "ecosystem.config.js"]