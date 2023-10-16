const express = require("express");
const cors = require("cors");
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

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            username: username
        },
        select: {
            salt: true,
            verifier: true,
        }
    });

    const serverEphemeral = srp.generateEphemeral(verifier);
    // TODO: Store `serverEphemeral.secret` for later use

    res.json({
        salt: user.salt,
        ephemeral: serverEphemeral.public
    });
});

app.post("/login", async (req, res) => {

})

app.listen(3000, () => {
    console.log('Server listening')
})