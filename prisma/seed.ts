import { PrismaClient, Gender } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminEmployee = await prisma.employee.upsert({
    where: { uuid: 1 },
    update: {},
    create: {
      uuid: 1,
      firstName: 'Super',
      lastName: 'Admin',
      gender: Gender.MALE,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@krest.com' },
    update: {},
    create: {
      email: 'admin@krest.com',
      passwordHash: hashedPassword,
      employeeId: adminEmployee.uuid,
      role: "SUPER_ADMIN"
    },
  });

  console.log('Super admin created successfully');
  console.log('Email: admin@krest.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

