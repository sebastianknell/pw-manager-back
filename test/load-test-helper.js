const srp = require("secure-remote-password/client");
const Faker = require("faker");

export function generateRegisterData(requestParams, ctx, ee, next) {
    // generate username, salt and verifier
    const username = Faker.internet.username(10);
    const password = Faker.internet.password(10);

    const salt = srp.generateSalt();
    const privateKey = srp.derivePrivateKey(salt, username, password);
    const verifier = srp.deriveVerifier(privateKey);
    ctx.vars["username"] = username;
    ctx.vars["password"] = password;
    ctx.vars["salt"] = salt;
    ctx.vars["verifier"] = verifier;

    return next();
}

export function generateEphemeralData(requestParams, ctx, ee, next) {
    const ephemeral = srp.generateEphemeral();
    ctx.vars["clientSecret"] = ephemeral.secret;
    ctx.vars["clientPublic"] = ephemeral.public;
    return next();
}

export function generateProof(requestParams, ctx, ee, next) {
    const username = ctx.vars["username"];
    const password = ctx.vars["password"];
    const salt = ctx.vars["salt"];
    const clientSecret = ctx.vars["clientSecret"];
    const privateKey = srp.derivePrivateKey(salt, username, password);
    const clientSession = srp.deriveSession(
        clientSecret,
        ephemeral, // todo: save on response
        salt,
        username,
        privateKey
    );
    ctx.vars["clientProof"] = clientSession.proof;

    return next();
}