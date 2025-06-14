export function compareOutputs(expected: string, actual: string): boolean {
  const cleanExpected = expected.trim().replace(/\r\n/g, "\n");
  const cleanActual = actual.trim().replace(/\r\n/g, "\n");

  return cleanExpected === cleanActual;
} 