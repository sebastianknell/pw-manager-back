const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.user.findMany().then(data => {
    console.log(data)
})