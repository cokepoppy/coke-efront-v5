import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrator with full access',
      permissions: {
        all: true,
      },
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Fund Manager' },
    update: {},
    create: {
      name: 'Fund Manager',
      description: 'Fund manager with access to fund management',
      permissions: {
        funds: ['read', 'create', 'update'],
        investments: ['read', 'create', 'update'],
        investors: ['read'],
      },
      isSystem: true,
    },
  });

  const analystRole = await prisma.role.upsert({
    where: { name: 'Analyst' },
    update: {},
    create: {
      name: 'Analyst',
      description: 'Analyst with read access',
      permissions: {
        funds: ['read'],
        investments: ['read'],
        investors: ['read'],
      },
      isSystem: true,
    },
  });

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@efront.com' },
    update: {},
    create: {
      email: 'admin@efront.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
      status: 'active',
    },
  });

  console.log('✅ Seeding completed successfully');
  console.log('📧 Admin user:', adminUser.email);
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
