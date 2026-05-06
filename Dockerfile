FROM node:20-alpine
RUN apk add --no-cache curl jq
WORKDIR /app
COPY src/package*.json ./
COPY src/prisma ./prisma 
RUN npm install
COPY src/ .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]