module.exports = {
  apps: [{
    name: 'microservice-example-hello',
    script: './built/server.js',
    watch: false,
    max_restarts: 5,
    restart_delay: 1000
  }],
};
