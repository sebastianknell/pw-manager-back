const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs")

// prisma.user.update({
//     where: {
//         username: "sebastianknell"
//     },
//     data: {
//         dataPath: "./data/aa.json"
//     }
// }).then(data => {
//     console.log(data)
// })

const data = fs.readFileSync("./data/aa.json")
console.log(data.toString())
console.log(JSON.parse(data)[0].web)