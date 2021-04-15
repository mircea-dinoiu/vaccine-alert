FROM node:14

WORKDIR /vaccine-alert

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY . .

CMD [ "node", "cron.js" ]
