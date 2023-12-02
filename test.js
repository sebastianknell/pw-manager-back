const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs")

// prisma.user
//     .update({
//         where: {
//             username: "guille2400",
//         },
//         data: {
//             dataPath: null,
//         },
//     })
//     .then((data) => console.log(data));

prisma.user
    .findMany({
        where: {
            username: "sebastianknell"
        }
    })
    .then((data) => console.log(data));
