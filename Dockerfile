FROM node:12

RUN mkdir -p /usr/storage-api
WORKDIR /usr/storage-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080

ENV EXPRESS_SERVER_PORT=8080
ENV DOWNLOAD_LOCATION='/usr/storage-api/uploadedFiles'
ENV MONGOOSE_CONNECTION='mongodb://mongo:27017/storage-api'

CMD ["npm", "run", "start"]