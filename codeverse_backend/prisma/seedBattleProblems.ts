import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedBattleProblems() {
  const exists = await prisma.problem.findFirst({ where: { title: 'Sum of Two Numbers' } });
  if (exists) {
    console.log('🟡 Battle problem already exists');
    return;
  }

  await prisma.problem.create({
    data: {
      title: 'Sum of Two Numbers',
      description: 'Return the sum of two numbers',
      difficulty: 'EASY',
      inputFormat: 'a b',
      outputFormat: 'sum',
      examples: [
        { input: '3 5', output: '8' },
        { input: '-2 7', output: '5' }
      ],
      constraints: 'a and b are integers',
      starterCode: `function sum(a: number, b: number): number {\n  // your code\n}`,
      testCases: [
        { input: '3 5', expectedOutput: '8' },
        { input: '-2 7', expectedOutput: '5' }
      ]
    }
  });

  console.log('✅ Battle problem seeded');
}
