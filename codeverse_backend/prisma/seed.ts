import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.problem.createMany({
    data: [
      {
        title: 'Two Sum',
        description: 'Find indices of the two numbers such that they add up to a specific target.',
        difficulty: 'Easy',
        inputFormat: 'nums = [2, 7, 11, 15], target = 9',
        outputFormat: '[0, 1]',
        examples: JSON.stringify([
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
          { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
        ]),
        constraints: 'Only one valid answer exists.',
        starterCode: `function twoSum(nums, target) {\n  // Your code here\n}`,
      },
      {
        title: 'Palindrome Number',
        description: 'Check if an integer is a palindrome.',
        difficulty: 'Easy',
        inputFormat: 'x = 121',
        outputFormat: 'true',
        examples: JSON.stringify([{ input: '121', output: 'true' }]),
        constraints: 'Do not convert the integer to a string.',
        starterCode: `function isPalindrome(x) {\n  // Your code here\n}`,
      },
    ],
  });
}

main()
  .then(() => console.log("Seeding done"))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
