FROM arizonatribe/centossupervisor
MAINTAINER David Nunez <arizonatribe@gmail.com>

ENV APP_NAME auth-db

WORKDIR /var/lib/${APP_NAME}
CMD ["/usr/bin/start"]

# Overlay, containing yum.repos.d, supervisord configs and other shell scripts
COPY docker /

# Install MongoDB
RUN yum install -y mongodb-org
RUN yum clean all
# The MongoDB database volume for persisting data beyond container start/stop
RUN mkdir -p /data/db
