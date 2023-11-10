const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.user
    .update({
        where: {
            username: "guille2400",
        },
        data: {
            dataPath: null,
        },
    })
    .then((data) => console.log(data));

// prisma.user
//     .findMany()
//     .then((data) => console.log(data));
