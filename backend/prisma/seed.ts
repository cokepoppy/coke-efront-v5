import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrator with full access',
      permissions: { all: true },
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
      phone: '+86 138 0000 0001',
      roleId: adminRole.id,
      status: 'active',
    },
  });

  console.log('✅ Admin user ready');

  // 清空现有业务数据（保留用户和角色）
  console.log('Cleaning existing business data...');
  await prisma.investorReport.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.valuation.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.distribution.deleteMany({});
  await prisma.capitalCall.deleteMany({});
  await prisma.fundInvestor.deleteMany({});
  await prisma.investment.deleteMany({});
  await prisma.fundMetric.deleteMany({});
  await prisma.investor.deleteMany({});
  await prisma.fund.deleteMany({});

  // 创建基金
  console.log('Creating funds...');
  const funds = await Promise.all([
    prisma.fund.create({
      data: {
        name: '中国成长基金 I 期',
        fundType: 'VC',
        totalSize: 500000000,
        currency: 'CNY',
        vintageYear: 2020,
        inceptionDate: new Date('2020-01-15'),
        fundTerm: 7,
        extensionPeriod: 2,
        status: 'investing',
        managementFeeRate: 0.02,
        performanceFeeRate: 0.20,
        hurdleRate: 0.08,
        domicile: '中国',
        custodianBank: '中国银行',
      },
    }),
    prisma.fund.create({
      data: {
        name: '全球并购基金 II 期',
        fundType: 'PE',
        totalSize: 1000000000,
        currency: 'USD',
        vintageYear: 2021,
        inceptionDate: new Date('2021-03-01'),
        fundTerm: 10,
        extensionPeriod: 2,
        status: 'investing',
        managementFeeRate: 0.02,
        performanceFeeRate: 0.20,
        hurdleRate: 0.08,
        domicile: '开曼群岛',
        custodianBank: 'JP Morgan',
      },
    }),
    prisma.fund.create({
      data: {
        name: '亚洲基础设施基金',
        fundType: 'Infrastructure',
        totalSize: 800000000,
        currency: 'USD',
        vintageYear: 2019,
        inceptionDate: new Date('2019-06-01'),
        fundTerm: 12,
        extensionPeriod: 3,
        status: 'investing',
        managementFeeRate: 0.015,
        performanceFeeRate: 0.15,
        hurdleRate: 0.07,
        domicile: '新加坡',
        custodianBank: 'DBS Bank',
      },
    }),
    prisma.fund.create({
      data: {
        name: '中国房地产基金',
        fundType: 'RE',
        totalSize: 600000000,
        currency: 'CNY',
        vintageYear: 2022,
        inceptionDate: new Date('2022-01-01'),
        fundTerm: 8,
        extensionPeriod: 2,
        status: 'investing',
        managementFeeRate: 0.018,
        performanceFeeRate: 0.18,
        hurdleRate: 0.075,
        domicile: '中国',
        custodianBank: '工商银行',
      },
    }),
  ]);
  console.log(`✅ Created ${funds.length} funds`);

  // 为每个基金创建基金指标
  console.log('Creating fund metrics...');
  for (const fund of funds) {
    await prisma.fundMetric.create({
      data: {
        fundId: fund.id,
        asOfDate: new Date(),
        nav: fund.totalSize * 0.85,
        irr: 15.5 + Math.random() * 10,
        moic: 1.3 + Math.random() * 0.5,
        dpi: 0.2 + Math.random() * 0.3,
        rvpi: 1.1 + Math.random() * 0.4,
        tvpi: 1.3 + Math.random() * 0.5,
        committedCapital: fund.totalSize,
        calledCapital: fund.totalSize * (0.6 + Math.random() * 0.2),
        distributedCapital: fund.totalSize * (0.1 + Math.random() * 0.15),
        remainingValue: fund.totalSize * (0.7 + Math.random() * 0.2),
      },
    });
  }
  console.log('✅ Created fund metrics');

  // 创建投资者
  console.log('Creating investors...');
  const investors = await Promise.all([
    prisma.investor.create({
      data: {
        name: '中国社保基金',
        investorType: 'institutional',
        domicile: '北京',
        country: '中国',
        email: 'contact@nssf.gov.cn',
        phone: '+86 10 8888 0001',
        status: 'active',
      },
    }),
    prisma.investor.create({
      data: {
        name: '新加坡政府投资公司',
        investorType: 'institutional',
        domicile: '新加坡',
        country: '新加坡',
        email: 'info@gic.com.sg',
        phone: '+65 6889 8888',
        status: 'active',
      },
    }),
    prisma.investor.create({
      data: {
        name: '腾讯投资',
        investorType: 'corporate',
        domicile: '深圳',
        country: '中国',
        email: 'investment@tencent.com',
        phone: '+86 755 8601 3388',
        status: 'active',
      },
    }),
    prisma.investor.create({
      data: {
        name: '红杉资本',
        investorType: 'fundOfFunds',
        domicile: '香港',
        country: '中国',
        email: 'contact@sequoiacap.com',
        phone: '+852 2531 6888',
        status: 'active',
      },
    }),
    prisma.investor.create({
      data: {
        name: '王氏家族办公室',
        investorType: 'familyOffice',
        domicile: '上海',
        country: '中国',
        email: 'office@wangfamily.com',
        phone: '+86 21 6888 0001',
        status: 'active',
      },
    }),
    prisma.investor.create({
      data: {
        name: '李明',
        investorType: 'hnwi',
        domicile: '北京',
        country: '中国',
        email: 'liming@example.com',
        phone: '+86 138 0001 0001',
        status: 'active',
      },
    }),
  ]);
  console.log(`✅ Created ${investors.length} investors`);

  // 创建基金-投资者关系
  console.log('Creating fund-investor relationships...');
  let fundInvestorCount = 0;
  for (const fund of funds) {
    const numInvestors = 2 + Math.floor(Math.random() * 3);
    const selectedInvestors = investors
      .sort(() => 0.5 - Math.random())
      .slice(0, numInvestors);

    for (const investor of selectedInvestors) {
      const commitmentAmount = fund.totalSize / numInvestors;
      await prisma.fundInvestor.create({
        data: {
          fundId: fund.id,
          investorId: investor.id,
          commitmentAmount: commitmentAmount,
          commitmentDate: new Date(
            fund.inceptionDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000
          ),
          calledAmount: commitmentAmount * (0.5 + Math.random() * 0.3),
          distributedAmount: commitmentAmount * (0.1 + Math.random() * 0.15),
          currentNav: commitmentAmount * (0.7 + Math.random() * 0.2),
          ownershipPercentage: 1 / numInvestors,
        },
      });
      fundInvestorCount++;
    }
  }
  console.log(`✅ Created ${fundInvestorCount} fund-investor relationships`);

  // 创建投资项目
  console.log('Creating investments...');
  const companies = [
    { name: '字节跳动', industry: '互联网', sector: 'TMT', region: '亚太', country: '中国' },
    { name: '蔚来汽车', industry: '汽车', sector: '制造业', region: '亚太', country: '中国' },
    { name: '美团', industry: '互联网', sector: 'TMT', region: '亚太', country: '中国' },
    { name: '宁德时代', industry: '新能源', sector: '制造业', region: '亚太', country: '中国' },
    { name: 'Grab', industry: '互联网', sector: 'TMT', region: '东南亚', country: '新加坡' },
    { name: '商汤科技', industry: '人工智能', sector: 'TMT', region: '亚太', country: '中国' },
    { name: 'Gojek', industry: '互联网', sector: 'TMT', region: '东南亚', country: '印尼' },
    { name: '小鹏汽车', industry: '汽车', sector: '制造业', region: '亚太', country: '中国' },
  ];

  const investments = [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    const numInvestments = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < numInvestments; j++) {
      const company = companies[(i * numInvestments + j) % companies.length];
      const investment = await prisma.investment.create({
        data: {
          fundId: fund.id,
          companyName: company.name,
          industry: company.industry,
          sector: company.sector,
          region: company.region,
          country: company.country,
          investmentDate: new Date(
            fund.inceptionDate.getTime() +
              Math.random() * 365 * 24 * 60 * 60 * 1000
          ),
          investmentStage: ['seed', 'early', 'growth', 'late'][
            Math.floor(Math.random() * 4)
          ] as any,
          investmentType: ['equity', 'debt', 'convertible', 'preferred'][
            Math.floor(Math.random() * 4)
          ] as any,
          initialInvestment: 10000000 + Math.random() * 90000000,
          ownershipPercentage: 0.05 + Math.random() * 0.20,
          currentValuation: 15000000 + Math.random() * 150000000,
          status: ['active', 'active', 'active', 'exited'][
            Math.floor(Math.random() * 4)
          ] as any,
        },
      });
      investments.push(investment);
    }
  }
  console.log(`✅ Created ${investments.length} investments`);

  // 为每个投资项目创建估值记录
  console.log('Creating valuations...');
  let valuationCount = 0;
  for (const investment of investments) {
    const numValuations = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numValuations; i++) {
      await prisma.valuation.create({
        data: {
          investmentId: investment.id,
          valuationDate: new Date(
            new Date(investment.investmentDate).getTime() +
              i * 180 * 24 * 60 * 60 * 1000
          ),
          fairValue: investment.initialInvestment * (1 + i * 0.2),
          valuationMethod: ['market', 'income', 'cost', 'transaction'][
            Math.floor(Math.random() * 4)
          ] as any,
          multiple: 1.5 + Math.random() * 2,
          notes: '根据最新市场情况和公司业绩进行估值调整',
        },
      });
      valuationCount++;
    }
  }
  console.log(`✅ Created ${valuationCount} valuations`);

  // 创建交易记录
  console.log('Creating transactions...');
  let transactionCount = 0;
  for (const investment of investments) {
    const numTransactions = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numTransactions; i++) {
      await prisma.transaction.create({
        data: {
          fundId: investment.fundId,
          transactionType: ['investment', 'distribution', 'fee'][
            Math.floor(Math.random() * 3)
          ] as any,
          transactionDate: new Date(
            new Date(investment.investmentDate).getTime() +
              i * 120 * 24 * 60 * 60 * 1000
          ),
          amount: 1000000 + Math.random() * 9000000,
          description: i === 0 ? `${investment.companyName} - 首次投资` : `${investment.companyName} - 第${i + 1}轮投资`,
          referenceId: investment.id,
          referenceType: 'investment',
        },
      });
      transactionCount++;
    }
  }
  console.log(`✅ Created ${transactionCount} transactions`);

  // 创建资本调用
  console.log('Creating capital calls...');
  let capitalCallCount = 0;
  let capitalCallDetailCount = 0;
  for (const fund of funds) {
    const fundInvestors = await prisma.fundInvestor.findMany({
      where: { fundId: fund.id },
      include: { investor: true },
    });

    const numCalls = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numCalls; i++) {
      const totalAmount = fundInvestors.reduce((sum, fi) => sum + Number(fi.commitmentAmount) * 0.2, 0);
      const receivedAmount = i < numCalls - 1 ? totalAmount : totalAmount * (0.5 + Math.random() * 0.5);

      const capitalCall = await prisma.capitalCall.create({
        data: {
          fundId: fund.id,
          callNumber: i + 1,
          callDate: new Date(
            fund.inceptionDate.getTime() +
              (i + 1) * 90 * 24 * 60 * 60 * 1000
          ),
          dueDate: new Date(
            fund.inceptionDate.getTime() +
              (i + 1) * 90 * 24 * 60 * 60 * 1000 +
              30 * 24 * 60 * 60 * 1000
          ),
          totalAmount: totalAmount,
          receivedAmount: receivedAmount,
          purpose: `第${i + 1}次资本调用 - 投资项目需求`,
          status: i < numCalls - 1 ? 'complete' : 'sent',
        },
      });
      capitalCallCount++;

      // 创建资本调用详情
      for (const fi of fundInvestors) {
        const calledAmount = Number(fi.commitmentAmount) * 0.2;
        const received = i < numCalls - 1 ? calledAmount : calledAmount * (0.5 + Math.random() * 0.5);

        await prisma.capitalCallDetail.create({
          data: {
            capitalCallId: capitalCall.id,
            investorId: fi.investorId,
            calledAmount: calledAmount,
            receivedAmount: received,
            receivedDate: i < numCalls - 1 ? new Date(
              fund.inceptionDate.getTime() +
                (i + 1) * 90 * 24 * 60 * 60 * 1000 +
                15 * 24 * 60 * 60 * 1000
            ) : null,
            status: i < numCalls - 1 ? 'paid' : 'pending',
          },
        });
        capitalCallDetailCount++;
      }
    }
  }
  console.log(`✅ Created ${capitalCallCount} capital calls with ${capitalCallDetailCount} details`);

  // 创建分配记录
  console.log('Creating distributions...');
  let distributionCount = 0;
  let distributionDetailCount = 0;
  for (const fund of funds) {
    const fundInvestors = await prisma.fundInvestor.findMany({
      where: { fundId: fund.id },
    });

    const numDistributions = Math.floor(Math.random() * 3);
    for (let i = 0; i < numDistributions; i++) {
      const totalAmount = fundInvestors.reduce((sum, fi) => sum + Number(fi.calledAmount) * 0.1, 0);
      const paidAmount = i < numDistributions - 1 ? totalAmount : totalAmount * (0.8 + Math.random() * 0.2);

      const distributionDate = new Date(
        fund.inceptionDate.getTime() +
          (i + 2) * 180 * 24 * 60 * 60 * 1000
      );

      const distribution = await prisma.distribution.create({
        data: {
          fundId: fund.id,
          distributionNumber: i + 1,
          distributionDate: distributionDate,
          paymentDate: new Date(distributionDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          distributionType: ['income', 'capitalGain', 'returnOfCapital'][Math.floor(Math.random() * 3)] as any,
          totalAmount: totalAmount,
          paidAmount: paidAmount,
          status: i < numDistributions - 1 ? 'complete' : 'processing',
          notes: `第${i + 1}次收益分配`,
        },
      });
      distributionCount++;

      // 创建分配详情
      for (const fi of fundInvestors) {
        const distributionAmount = Number(fi.calledAmount) * 0.1;
        const paid = i < numDistributions - 1 ? distributionAmount : distributionAmount * (0.8 + Math.random() * 0.2);
        const withholdingTax = paid * 0.1;
        const netAmount = paid - withholdingTax;

        await prisma.distributionDetail.create({
          data: {
            distributionId: distribution.id,
            investorId: fi.investorId,
            distributionAmount: distributionAmount,
            paidAmount: paid,
            paymentDate: i < numDistributions - 1 ? new Date(distributionDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
            status: i < numDistributions - 1 ? 'paid' : 'pending',
            withholdingTax: withholdingTax,
            netAmount: netAmount,
          },
        });
        distributionDetailCount++;
      }
    }
  }
  console.log(`✅ Created ${distributionCount} distributions with ${distributionDetailCount} details`);

  // 创建文档
  console.log('Creating documents...');
  const documentTypes = ['contract', 'report', 'statement', 'certificate', 'presentation'];
  const categories = ['fund', 'investment', 'investor', 'legal', 'financial'];
  let documentCount = 0;

  for (const fund of funds) {
    for (let i = 0; i < 5; i++) {
      await prisma.document.create({
        data: {
          name: `${fund.name} - ${['基金合同', '年度报告', '季度报表', '审计报告', '投资备忘录'][i]}`,
          documentType: documentTypes[i],
          category: categories[i % categories.length],
          fileUrl: `/documents/${fund.id}/doc_${i + 1}.pdf`,
          fileSize: Math.floor(1024 * (100 + Math.random() * 900)),
          mimeType: 'application/pdf',
          version: 1,
          relatedEntityType: 'fund',
          relatedEntityId: fund.id,
          isPublic: false,
          uploadedBy: adminUser.id,
          uploadedAt: new Date(),
        },
      });
      documentCount++;
    }
  }
  console.log(`✅ Created ${documentCount} documents`);

  // 创建事件
  console.log('Creating events...');
  const eventTypes = ['meeting', 'deadline', 'milestone', 'reminder'];
  const eventCategories = ['fund', 'investment', 'investor', 'company'];
  let eventCount = 0;

  const today = new Date();
  for (let i = -30; i < 90; i += 7) {
    const eventDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const fund = funds[Math.floor(Math.random() * funds.length)];

    await prisma.event.create({
      data: {
        title: [
          '董事会会议',
          '季度审查',
          '投资者年会',
          '尽职调查',
          '合同签署',
          '估值审查',
        ][Math.floor(Math.random() * 6)],
        description: '讨论基金运营和投资进展',
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        category: eventCategories[Math.floor(Math.random() * eventCategories.length)],
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
        location: ['北京', '上海', '深圳', '香港', '新加坡', '线上会议'][
          Math.floor(Math.random() * 6)
        ],
        isAllDay: false,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
          Math.floor(Math.random() * 5)
        ],
        reminder: 60,
        relatedEntityType: 'fund',
        relatedEntityId: fund.id,
        status: i < 0 ? 'completed' : 'scheduled',
        createdBy: adminUser.id,
      },
    });
    eventCount++;
  }
  console.log(`✅ Created ${eventCount} events`);

  // 创建投资者报告
  console.log('Creating investor reports...');
  let investorReportCount = 0;

  // 为每个基金的每个投资者创建报告
  for (const fund of funds) {
    const fundInvestorRelations = await prisma.fundInvestor.findMany({
      where: { fundId: fund.id },
      select: { investorId: true },
    });

    for (const relation of fundInvestorRelations) {
      // 创建2023年的季度报告
      for (let quarter = 1; quarter <= 4; quarter++) {
        const status = quarter < 3 ? 'sent' : quarter === 3 ? 'generated' : 'draft';
        const reportDate = new Date(2023, (quarter - 1) * 3, 1);

        await prisma.investorReport.create({
          data: {
            investorId: relation.investorId,
            fundId: fund.id,
            reportType: 'quarterly',
            year: 2023,
            quarter: quarter,
            reportDate: reportDate,
            status: status,
            generatedAt: status !== 'draft' ? new Date(2023, (quarter - 1) * 3 + 2, 15) : null,
            sentAt: status === 'sent' ? new Date(2023, (quarter - 1) * 3 + 2, 20) : null,
            reportUrl: status !== 'draft' ? `/reports/investor-report-2023-Q${quarter}-${fund.id}.pdf` : null,
            notes: status === 'draft' ? '待生成报告' : `${2023}年第${quarter}季度投资者报告`,
            createdBy: adminUser.id,
          },
        });
        investorReportCount++;
      }

      // 创建2023年年度报告
      await prisma.investorReport.create({
        data: {
          investorId: relation.investorId,
          fundId: fund.id,
          reportType: 'annual',
          year: 2023,
          reportDate: new Date(2023, 11, 31),
          status: 'sent',
          generatedAt: new Date(2024, 0, 15),
          sentAt: new Date(2024, 0, 20),
          reportUrl: `/reports/investor-report-2023-annual-${fund.id}.pdf`,
          notes: '2023年度投资者报告',
          createdBy: adminUser.id,
        },
      });
      investorReportCount++;

      // 创建2024年的部分季度报告
      for (let quarter = 1; quarter <= 2; quarter++) {
        const status = quarter === 1 ? 'sent' : 'generated';
        const reportDate = new Date(2024, (quarter - 1) * 3, 1);

        await prisma.investorReport.create({
          data: {
            investorId: relation.investorId,
            fundId: fund.id,
            reportType: 'quarterly',
            year: 2024,
            quarter: quarter,
            reportDate: reportDate,
            status: status,
            generatedAt: new Date(2024, (quarter - 1) * 3 + 2, 15),
            sentAt: status === 'sent' ? new Date(2024, (quarter - 1) * 3 + 2, 20) : null,
            reportUrl: `/reports/investor-report-2024-Q${quarter}-${fund.id}.pdf`,
            notes: `${2024}年第${quarter}季度投资者报告`,
            createdBy: adminUser.id,
          },
        });
        investorReportCount++;
      }
    }
  }
  console.log(`✅ Created ${investorReportCount} investor reports`);

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`- ${funds.length} funds`);
  console.log(`- ${investors.length} investors`);
  console.log(`- ${fundInvestorCount} fund-investor relationships`);
  console.log(`- ${investments.length} investments`);
  console.log(`- ${valuationCount} valuations`);
  console.log(`- ${transactionCount} transactions`);
  console.log(`- ${capitalCallCount} capital calls with ${capitalCallDetailCount} details`);
  console.log(`- ${distributionCount} distributions with ${distributionDetailCount} details`);
  console.log(`- ${documentCount} documents`);
  console.log(`- ${eventCount} events`);
  console.log(`- ${investorReportCount} investor reports`);
  console.log('');
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
