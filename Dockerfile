FROM node
RUN mkdir -p /src/app/
WORKDIR /src/app
#COPY . /src/app/
COPY package.json /src/app/package.json
COPY . /src/app
#RUN npm config set proxy http://10.16.11.25:9090
#RUN npm config set https-proxy http://10.16.11.25:9090
RUN npm install 
EXPOSE 3000
COPY . /src/app
CMD [ "npm", "start" ]