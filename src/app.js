var Server = require('./Server'),
    opts = {
        port: process.env.PORT
        },
    server;

server = new Server(opts);
server.start();
