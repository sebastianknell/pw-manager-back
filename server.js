const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const srp = require('secure-remote-password/server')
const tokenSecret = "youraccesstokensecret";

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const salt = req.body.salt;
    const verifier = req.body.verifier;

    await prisma.user.create({
        data: {
            username,
            salt,
            verifier,
        }
    });
    res.send()
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

    // TODO: caso cuando el usuario no existe
    const serverEphemeral = srp.generateEphemeral(user.verifier);

    await prisma.user.update({
        where: {
            username: username
        },
        data: {
            serverSecretEphemeral: serverEphemeral.secret,
            clientPublicEphemeral: ephemeral
        }
    });

    res.json({
        salt: user.salt,
        ephemeral: serverEphemeral.public,
    });
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
        const serverSession = srp.deriveSession(user.serverSecretEphemeral, user.clientPublicEphemeral, user.salt, username, user.verifier, proof);
        console.log(serverSession.key);

        const token = jwt.sign({userId: user.userId, username}, tokenSecret);
        console.log(token);
        res.json({
            proof: serverSession.proof,
            token,
        });
    } catch (e) {
        console.log(e);
        res.sendStatus(403);
    }
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, tokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.get("/getpasswords", authenticateJWT, async (req, res) => {
    const { userId} = req.user;

    const userData = await prisma.user.findFirst({
        where: {
            userId: userId
        },
        select: {
            dataPath: true,
        }
    });

    const data = fs.readFileSync(userData.dataPath);
    res.json(JSON.parse(data));
})

app.listen(5050, () => {
    console.log('Server listening')
});