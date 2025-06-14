import { seedProblems } from './seedProblems';
import { seedBattleProblems } from './seedBattleProblems';

async function main() {
  await seedProblems();
  await seedBattleProblems();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });
