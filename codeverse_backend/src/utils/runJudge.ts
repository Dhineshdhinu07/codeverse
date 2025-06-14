export function runJudge(userOutput: any, expectedOutput: string): boolean {
  const userOutputStr = JSON.stringify(userOutput);
  const expectedStr = expectedOutput;

  return userOutputStr === expectedStr;
}

export function evaluateAll(testCases: { input: string; output: string }[], userFunction: Function) {
  for (const testCase of testCases) {
    const input = JSON.parse(testCase.input);
    let result;

    if (typeof input === 'object' && input.hasOwnProperty("input") && input.hasOwnProperty("target")) {
      result = userFunction(input.input, input.target);
    } else {
      result = userFunction(input);
    }

    const passed = runJudge(result, testCase.output);
    if (!passed) return false;
  }
  return true;
} 