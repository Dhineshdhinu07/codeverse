export function validateTestcases(testcases: any[]): boolean {
  if (!Array.isArray(testcases)) return false;

  return testcases.every(tc => {
    return (
      typeof tc.input === "string" &&
      typeof tc.output === "string"
    );
  });
} 