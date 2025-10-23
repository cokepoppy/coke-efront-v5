import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding funds...');

  // Create some test funds
  const funds = [
    {
      name: '红杉中国成长基金 I 期',
      fundType: 'PE',
      totalSize: 500000000, // 5亿
      currency: 'CNY',
      vintageYear: 2020,
      inceptionDate: new Date('2020-01-15'),
      status: 'investing',
    },
    {
      name: 'IDG 早期创投基金',
      fundType: 'VC',
      totalSize: 200000000, // 2亿
      currency: 'USD',
      vintageYear: 2021,
      inceptionDate: new Date('2021-03-01'),
      status: 'fundraising',
    },
    {
      name: '高瓴资本并购基金 III',
      fundType: 'PE',
      totalSize: 1000000000, // 10亿
      currency: 'USD',
      vintageYear: 2022,
      inceptionDate: new Date('2022-06-01'),
      status: 'investing',
    },
    {
      name: '君联资本成长基金',
      fundType: 'PE',
      totalSize: 300000000, // 3亿
      currency: 'CNY',
      vintageYear: 2023,
      inceptionDate: new Date('2023-01-01'),
      status: 'investing',
    },
  ];

  for (const fund of funds) {
    const created = await prisma.fund.create({
      data: fund,
    });
    console.log(`✅ Created fund: ${created.name}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
