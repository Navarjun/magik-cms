const dbUri = process.env.MAGIK_DB_URI;
const dbName = process.env.MAGIK_DB_NAME ? process.env.MAGIK_DB_NAME : 'magik';
const sessionEncryptionKey = process.env.MAGIK_SESSION_KEY ? process.env.MAGIK_SESSION_KEY : 'magik-key'; // encryption secret for sessions
const passwordEncryptionSalt = process.env.MAGIK_PSWD_SALT ? process.env.MAGIK_PSWD_SALT : 'magik-salt';

var config = {
    database: {
        uri: dbUri || 'mongodb://localhost:27017/' + dbName
    },
    encryption: {
        passwordSaltRounds: 10,
        sessionSecret: sessionEncryptionKey
    }
};

module.exports = config;
