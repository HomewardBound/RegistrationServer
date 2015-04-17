var Server = require('./Server'),
    opts = {
        mongoURI: 'mongodb://localhost:27017/homeward-bound'
        },
    server;

// Set config
if (process.env.NODE_ENV === 'production') {
    opts.port = 80;
    opts.mongoUsername = process.env.MONGO_USERNAME || null;
    opts.mongoPassword = process.env.MONGO_PASSWORD || null;
    opts.mongoURI = process.env.MONGO_URI;
}

server = new Server(opts);
server.start();
