FROM node:current-alpine
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 4001 5000
CMD ["npm", "start"]