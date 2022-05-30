FROM node:12-alpine
WORKDIR /app/
RUN apk --no-cache add --virtual native-deps openssl\
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

COPY package*.json ./
RUN npm install --production
COPY . ./
ENV HOST ekskog.net
ENV PORT 48000
ENV RESOURCEPATH /nodePLC
EXPOSE 48000
CMD ["node", "server.js"]
