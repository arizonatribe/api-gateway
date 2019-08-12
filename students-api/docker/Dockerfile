FROM arizonatribe/centosnodesupervisor
MAINTAINER David Nunez <arizonatribe@gmail.com>

ENV APP_DIR=/usr/app
WORKDIR $APP_DIR

# Overlay, containing yum.repos.d, supervisord configs and other shell scripts
COPY docker/root /

RUN yum install -y mongodb-org
RUN yum clean all

RUN mkdir -p /data/db

# Split these steps up based on how often they change, resulting in super-fast builds
COPY package.json $APP_DIR/
RUN npm install
COPY lib/* $APP_DIR/

CMD ["/usr/bin/start"]
