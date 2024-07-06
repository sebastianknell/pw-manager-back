export function generateRegisterData(requestParams, ctx, ee, next) {
    // generate username, salt and verifier
    ctx.vars["username"] = "";
    return next();
}

export function generateEphemeral(requestParams, ctx, ee, next) {}

export function generateProof(requestParams, ctx, ee, next) {}