const MagikError = function (code, message) {
    return { code: code, message: message };
};

module.exports = MagikError;
