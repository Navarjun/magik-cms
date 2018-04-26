const dbUri = process.env.MAGIK_DB_URI;
const dbName = process.env.MAGIK_DB_NAME ? process.env.MAGIK_DB_NAME : 'magik';

var config = {
    database: {
        uri: dbUri || 'mongodb://localhost:27017/' + dbName
    }
};

module.exports = config;
