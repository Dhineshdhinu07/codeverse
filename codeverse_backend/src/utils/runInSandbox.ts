export async function runInSandbox(code: string, input: any): Promise<any> {
  // Wrap user code inside a function for controlled execution
  const functionWrapper = `
    ${code}
    return main(${serializeInput(input)});
  `;

  try {
    const result = new Function(functionWrapper)();
    return result;
  } catch (err) {
    console.error("Execution error:", err);
    throw new Error(`Execution failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// Serialize input to string properly
function serializeInput(input: any): string {
  if (Array.isArray(input)) return JSON.stringify(input);
  if (typeof input === 'object') return JSON.stringify(input);
  return JSON.stringify(input);
} 