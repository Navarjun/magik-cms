const dbUri = process.env.MAGIK_DB_URI;
const dbName = process.env.MAGIK_DB_NAME || 'magik';
const sessionEncryptionKey = process.env.MAGIK_SESSION_KEY; // encryption secret for sessions
const passwordEncryptionSaltRounds = process.env.MAGIK_PSWD_SALT_ROUNDS;

var config = {
    database: {
        uri: dbUri || 'mongodb://localhost:27017/' + dbName
    },
    encryption: {
        passwordSaltRounds: passwordEncryptionSaltRounds || 10,
        sessionSecret: sessionEncryptionKey || 'magik-key'
    }
};

module.exports = config;
