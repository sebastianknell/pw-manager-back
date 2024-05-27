FROM amd64/node:18-alpine
WORKDIR /app
COPY . .
RUN npm i
RUN npx prisma generate
EXPOSE 5050
CMD [ "node", "server.js" ]