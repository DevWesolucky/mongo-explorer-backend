FROM node:14
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm install pm2 -g
COPY . .
RUN npm run transpile
CMD [ "pm2-runtime", "start", "pm2.config.js", "--watch"]