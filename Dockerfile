FROM node:18-alpine
ENV TZ=Europe/Moscow
WORKDIR /app

# Сначала только package.json
COPY package*.json ./
RUN npm install

# Потом остальное
COPY . .

EXPOSE 3001
CMD ["npm", "run", "dev"]