FROM arizonatribe/centosnodesupervisor
MAINTAINER David Nunez <arizonatribe@gmail.com>

ENV NPM_COMMAND start
ENV APP_NAME auth-provider

EXPOSE 5100
WORKDIR /var/lib/${APP_NAME}
CMD ["/usr/bin/start"]

# Overlay, containing yum.repos.d, supervisord configs and other shell scripts
COPY docker /

# Copy NPM manifest here so that the `npm install` only happens when required dependencies change
COPY package.json /var/lib/${APP_NAME}/package.json
# Install node dependencies specific to this project
RUN cd /var/lib/${APP_NAME} && npm install --production

# Environment files, and linter/transpiler config files
COPY .e* .b* /var/lib/${APP_NAME}/
# Application-specific JavaScript files
COPY src /var/lib/${APP_NAME}/src
