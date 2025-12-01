const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('123456', 10)

    const user = await prisma.user.upsert({
        where: { email: 'admin@rkdagencies.com' },
        update: {},
        create: {
            email: 'admin@rkdagencies.com',
            name: 'Admin',
            password,
            role: 'ADMIN',
            mobile: '9876543210',
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
