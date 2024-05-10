const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();
const crypto = require("crypto-js");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const srp = require("secure-remote-password/server");
const tokenSecret = "youraccesstokensecret";

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const salt = req.body.salt;
    const verifier = req.body.verifier;

    const encryptionSalt = crypto.lib.WordArray.random(16).toString(
        crypto.enc.Hex,
    );

    await prisma.user.create({
        data: {
            username,
            salt,
            verifier,
            encryptionSalt,
        },
    });

    res.send();
});

app.post("/generate", async (req, res) => {
    const username = req.body.username;
    const ephemeral = req.body.ephemeral;

    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            salt: true,
            verifier: true,
        },
    });

    if (user) {
        const serverEphemeral = srp.generateEphemeral(user.verifier);

        // TODO: añadir campo que reserve usuarios ya que no se podrían loggear 2 a la vez pq es mas de 1 paso
        await prisma.user.update({
            where: {
                username: username,
            },
            data: {
                serverSecretEphemeral: serverEphemeral.secret,
                clientPublicEphemeral: ephemeral,
            },
        });

        res.json({
            salt: user.salt,
            ephemeral: serverEphemeral.public,
        });
    } else {
        // Manejo de error si el usuario no existe
        res.status(400).json({ error: "Usuario no encontrado" });
    }
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const proof = req.body.proof;

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            username: username,
        },
    });

    try {
        const serverSession = srp.deriveSession(
            user.serverSecretEphemeral,
            user.clientPublicEphemeral,
            user.salt,
            username,
            user.verifier,
            proof,
        );
        console.log(serverSession.key);

        const token = jwt.sign(
            {
                userId: user.userId,
                username,
                encryptionSalt: user.encryptionSalt,
            },
            tokenSecret,
            { expiresIn: "300s" },
        );
        console.log(token);
        res.json({
            proof: serverSession.proof,
            token,
        });
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, tokenSecret, (err, user) => {
            if (err) {
                console.log("invalid token");
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        console.log("missing header");
        res.sendStatus(401);
    }
};

app.get("/getpasswords", authenticateJWT, async (req, res) => {
    const { userId } = req.user;
    console.log(userId);

    const userData = await prisma.user.findFirst({
        where: {
            userId: userId,
        },
    });

    if (!userData || !userData.dataPath) {
        return res.json({
            passwordData: "",
            encryptionIV: "",
            tag: "",
        });
    }

    // const data = fs.readFileSync(userData.dataPath);
    return res.json({
        passwordData: userData.dataPath,
        encryptionIV: userData.encryptionIV,
        tag: userData.encryptionTag,
    });
});

app.post("/savepasswords", authenticateJWT, async (req, res) => {
    const { userId } = req.user;
    const passwordData = req.body.passwordData;
    const encryptionIV = req.body.encryptionIV;
    const tag = req.body.tag;
    console.log(userId);
    console.log(passwordData);
    console.log(encryptionIV);

    await prisma.user.update({
        where: {
            userId: userId,
        },
        data: {
            dataPath: passwordData,
            encryptionIV,
            encryptionTag: tag,
        },
    });

    res.send();
});

app.listen(5050, () => {
    console.log("Server listening");
});
