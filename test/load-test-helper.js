const srp = require("secure-remote-password/client");
const { faker } = require("@faker-js/faker");

function generateRegisterData(requestParams, ctx, ee, next) {
    // generate username, salt and verifier
    const username = faker.internet.userName();
    const password = faker.internet.password();

    const salt = srp.generateSalt();
    const privateKey = srp.derivePrivateKey(salt, username, password);
    const verifier = srp.deriveVerifier(privateKey);
    ctx.vars["username"] = username;
    ctx.vars["password"] = password;
    ctx.vars["salt"] = salt;
    ctx.vars["verifier"] = verifier;

    return next();
}

function generateEphemeralData(requestParams, ctx, ee, next) {
    const ephemeral = srp.generateEphemeral();
    ctx.vars["clientSecret"] = ephemeral.secret;
    ctx.vars["clientPublic"] = ephemeral.public;
    return next();
}

function generateProof(requestParams, ctx, ee, next) {
    const username = ctx.vars["username"];
    const password = ctx.vars["password"];
    const salt = ctx.vars["salt"];
    const clientSecret = ctx.vars["clientSecret"];
    const serverPublic = ctx.vars["serverPublic"];
    const privateKey = srp.derivePrivateKey(salt, username, password);
    const clientSession = srp.deriveSession(
        clientSecret,
        serverPublic,
        salt,
        username,
        privateKey
    );
    ctx.vars["clientProof"] = clientSession.proof;

    return next();
}

function generatePasswordData(requestParams, ctx, ee, next) {
    ctx.vars["passwordData"] =
        "aDMUz/pA6Ao6kHD98s0JlmwhnS3LiEGBnfza42suTloIMIp6jUQ00ZxFoYZfUFGSwk7WrXR3957dIm3Qjr7zaRoxsm7BygEbV/6rfI0f2XlKYEm2Mo4RtQuDpP0zy950OH2q95lNCM4CxLB6GEsDQdqHVxLkVSiZZQ==";
    ctx.vars["encryptionIV"] = "w3C/aW/daldENS7K";
    return next();
}

module.exports = {
    generateRegisterData,
    generateEphemeralData,
    generateProof,
    generatePasswordData,
};
