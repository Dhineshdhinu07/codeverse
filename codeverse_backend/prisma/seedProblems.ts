import { PrismaClient } from '@prisma/client';
import { normalizeTestCases } from "../src/utils/normalizeProblem";

const prisma = new PrismaClient();

export async function seedProblems() {
  await prisma.problem.deleteMany();

  const problems = [
    {
      title: 'Palindrome Number',
      description: 'Check if an integer is a palindrome.',
      difficulty: 'Easy',
      inputFormat: 'x = 121',
      outputFormat: 'true',
      examples: JSON.stringify([{ input: '121', output: 'true' }]),
      constraints: 'Do not convert the integer to a string.',
      starterCode: `function isPalindrome(x) {\n  // Your code here\n}`,
      testCases: JSON.stringify(normalizeTestCases([
        { input: 121, output: true },
        { input: -121, output: false },
        { input: 10, output: false }
      ]))
    },
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
      testCases: JSON.stringify(normalizeTestCases([
        { input: [2, 7, 11, 15], target: 9, output: [0, 1] },
        { input: [3, 2, 4], target: 6, output: [1, 2] },
        { input: [3, 3], target: 6, output: [0, 1] }
      ]))
    },
    {
      title: 'Valid Parentheses',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      difficulty: 'Easy',
      inputFormat: 's = "()"',
      outputFormat: 'true',
      examples: JSON.stringify([
        { input: '"()"', output: 'true' },
        { input: '"()[]{}"', output: 'true' },
        { input: '"(]"', output: 'false' }
      ]),
      constraints: '1 <= s.length <= 104',
      starterCode: `function isValid(s) {\n  // Your code here\n}`,
      testCases: JSON.stringify(normalizeTestCases([
        { input: "()", output: true },
        { input: "()[]{}", output: true },
        { input: "(]", output: false },
        { input: "([)]", output: false },
        { input: "{[]}", output: true }
      ]))
    },
    {
      title: 'Merge Sorted Array',
      description: 'Merge two sorted arrays nums1 and nums2 into a single sorted array.',
      difficulty: 'Easy',
      inputFormat: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3',
      outputFormat: '[1,2,2,3,5,6]',
      examples: JSON.stringify([
        { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' }
      ]),
      constraints: 'nums1.length == m + n',
      starterCode: `function merge(nums1, m, nums2, n) {\n  // Your code here\n}`,
      testCases: JSON.stringify(normalizeTestCases([
        { 
          input: { nums1: [1,2,3,0,0,0], m: 3, nums2: [2,5,6], n: 3 },
          output: [1,2,2,3,5,6]
        },
        {
          input: { nums1: [1], m: 1, nums2: [], n: 0 },
          output: [1]
        },
        {
          input: { nums1: [0], m: 0, nums2: [1], n: 1 },
          output: [1]
        }
      ]))
    }
  ];

  for (const problem of problems) {
    await prisma.problem.create({ data: problem });
  }

  console.log("Problems seeded successfully");
}

