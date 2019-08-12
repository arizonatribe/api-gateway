FROM arizonatribe/nodevana
MAINTAINER David Nunez <arizonatribe@gmail.com>

ENV APP_DIR=/usr/app
WORKDIR $APP_DIR

RUN npm install --global serve

# Split these steps up based on how often they change, resulting in super-fast builds
COPY public  $APP_DIR/public
COPY package.json  $APP_DIR/
RUN npm install
COPY src  $APP_DIR/src

RUN npm run build

EXPOSE 3000
CMD ["serve", "-s", "/usr/app/build", "-p", "3000"]
