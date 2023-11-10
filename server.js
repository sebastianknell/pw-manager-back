const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();
const crypto = require("crypto-js");
const copyPaste = require("copy-paste");

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

    const secretKey = crypto.lib.WordArray.random(16).toString(crypto.enc.Hex);
    const encryptionSalt = crypto.lib.WordArray.random(16).toString(
        crypto.enc.Hex
    );

    await prisma.user.create({
        data: {
            username,
            salt,
            verifier,
            secretKey, // Guardamos la clave secreta en la base de datos
            encryptionSalt
        },
    });

    // Muestra la clave secreta al usuario y cópiala al portapapeles
    console.log("Secret Key:", secretKey);
    try {
        copyPaste.copy(secretKey, () => {
            console.log("Clave copiada al portapapeles");
        });
    } catch (error) {
        console.error(
            "Error al copiar la clave al portapapeles:",
            error.message
        );
    }

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
            secretKey: true, // Asegúrate de incluir la secretKey en la respuesta
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
            user: {
                secretKey: user.secretKey, // Incluye la secretKey en la respuesta
            },
        });
    } else {
        // Manejo de error si el usuario no existe
        res.status(404).json({ error: "Usuario no encontrado" });
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
        // Use la secretKey almacenada en la base de datos como contraseña durante la autenticación
        const serverSession = srp.deriveSession(
            user.serverSecretEphemeral,
            user.clientPublicEphemeral,
            user.salt,
            username,
            user.verifier,
            proof
        );
        console.log(serverSession.key);

        const token = jwt.sign({ userId: user.userId, username, encryptionSalt: user.encryptionSalt }, tokenSecret, {expiresIn: "300s"});
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
    const { userId } = req.user;
    console.log(userId);

    const userData = await prisma.user.findFirst({
        where: {
            userId: userId,
        },
    });

    if (!userData || !userData.dataPath) {
        return res.json({ passwordData: "" });
    }

    // const data = fs.readFileSync(userData.dataPath);
    return res.json({ passwordData: userData.dataPath, encryptionIV: userData.encryptionIV });
});

app.post("/savepasswords", authenticateJWT, async (req, res) => {
    const { userId } = req.user;
    const passwordData = req.body.passwordData;
    console.log(userId)
    console.log(passwordData);

    await prisma.user.update({
        where: {
            userId: userId,
        },
        data: {
            dataPath: passwordData,
        },
    });

    res.send();
});

app.listen(5050, () => {
    console.log("Server listening");
});
