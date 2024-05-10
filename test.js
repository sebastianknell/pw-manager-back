const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs")

// prisma.user
//     .update({
//         where: {
//             username: "sebastianknell2",
//         },
//         data: {
//             dataPath: null,
//         },
//     })
//     .then((data) => console.log(data));

prisma.user
    .findFirst({
        where: {
            username: "sebastianknell2"
        },
    })
    .then((data) => console.log(data));
