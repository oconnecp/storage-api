FROM node:10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080

ENV EXPRESS_SERVER_PORT=8080
ENV DOWNLOAD_LOCATION='/usr/src/app/uploadedFiles'
ENV MONGOOSE_CONNECTION='mongodb://mongo:27017/storage-api'

CMD ["npm", "run", "start"]