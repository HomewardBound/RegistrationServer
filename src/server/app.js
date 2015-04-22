var Server = require('./Server'),
    dotenv = require('dotenv'),
    opts = {
        port: process.env.PORT
        },
    server;

dotenv.load();
server = new Server(opts);
server.start();
