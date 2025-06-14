import { PrismaClient } from "@prisma/client";
import { evaluateAll } from "./runJudge";

const prisma = new PrismaClient();

async function testJudge() {
  // Test Palindrome Number
  const palindromeProblem = await prisma.problem.findFirst({
    where: { title: 'Palindrome Number' }
  });

  if (palindromeProblem) {
    console.log("\nTesting Palindrome Number:");
    
    // Correct solution
    const correctSolution = (x: number) => {
      if (x < 0) return false;
      let reversed = 0;
      let original = x;
      while (x > 0) {
        reversed = reversed * 10 + x % 10;
        x = Math.floor(x / 10);
      }
      return reversed === original;
    };

    // Incorrect solution
    const incorrectSolution = (x: number) => {
      return x > 0;
    };

    console.log("Testing correct solution:");
    const correctResult = evaluateAll(palindromeProblem.testCases, correctSolution);
    console.log("All tests passed:", correctResult);

    console.log("\nTesting incorrect solution:");
    const incorrectResult = evaluateAll(palindromeProblem.testCases, incorrectSolution);
    console.log("All tests passed:", incorrectResult);
  }

  // Test Two Sum
  const twoSumProblem = await prisma.problem.findFirst({
    where: { title: 'Two Sum' }
  });

  if (twoSumProblem) {
    console.log("\nTesting Two Sum:");
    
    // Correct solution
    const correctSolution = (nums: number[], target: number) => {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
          return [map.get(complement), i];
        }
        map.set(nums[i], i);
      }
      return [];
    };

    // Incorrect solution
    const incorrectSolution = (nums: number[], target: number) => {
      return [0, 1];
    };

    console.log("Testing correct solution:");
    const correctResult = evaluateAll(twoSumProblem.testCases, correctSolution);
    console.log("All tests passed:", correctResult);

    console.log("\nTesting incorrect solution:");
    const incorrectResult = evaluateAll(twoSumProblem.testCases, incorrectSolution);
    console.log("All tests passed:", incorrectResult);
  }

  await prisma.$disconnect();
}

testJudge().catch(console.error); 