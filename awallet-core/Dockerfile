FROM node:20-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD npm run start
