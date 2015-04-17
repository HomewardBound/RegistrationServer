var Server = require('./Server'),
    opts = {},
    server;

// Set config
if (process.env.NODE_ENV === 'production') {
    opts.port = 80;
}

server = new Server(opts);
server.start();
