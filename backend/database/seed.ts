import bcrypt from 'bcrypt';
import { PrismaClient, Role } from "./src/index";
const prisma = new PrismaClient();


async function seedProd() {
  if (!process.env.ADMIN_PASSWORD) {
    throw Error('no admin password provided for seed script. set ADMIN_PASSWORD var in the file .env');
  }

  const password = process.env.ADMIN_PASSWORD;
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data:
    {
      username: 'superadmin',
      password: hashedPassword,
      role: 'superadmin',
    },
  })
}



async function seedDev() {
  if (!process.env.ADMIN_PASSWORD) {
    throw Error('no admin password provided for seed script. set ADMIN_PASSWORD var in the file .env');
  }

  const password = process.env.ADMIN_PASSWORD;
  let hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data:
    {
      username: 'superadmin',
      password: hashedPassword,
      role: 'superadmin'
    },
  })

  hashedPassword = await bcrypt.hash('123', 10);

  const userRole: Role = 'user';
  await prisma.user.create({
    data: {
      username: 'user1',
      password: hashedPassword,
      role: userRole,
    }
  })

  const cameraRole: Role = 'sender';
  await prisma.user.create({
    data: {
      username: 'sender',
      password: hashedPassword,
      role: cameraRole,
    }
  })

}

if (process.env.DEVELOPMENT) {
  console.log('seeding db with development dummy data');
  seedDev();
} else {
  console.log('seeding db with prod data');
  seedProd();
}
