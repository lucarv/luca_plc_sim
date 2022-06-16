FROM node:16-alpine
WORKDIR /app/
RUN apk --no-cache add --virtual native-deps openssl\
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python3 git && \
  npm install --quiet node-gyp -g

COPY package*.json ./
RUN npm install --production
COPY . ./
EXPOSE 48000
CMD ["node", "server.js"]
