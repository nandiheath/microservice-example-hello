module.exports = {
  apps: [{
    name: 'microservice-example-hello',
    script: './built/server.js',
    watch: false,
    max_restarts: 5,  // Maximum restart 5 times.
    restart_delay: 1000
  }],
};
