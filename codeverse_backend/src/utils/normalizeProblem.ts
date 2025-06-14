interface RawTestCase {
  input: any;
  target?: any;
  output: any;
}

interface NormalizedTestCase {
  input: string;
  output: string;
}

export function normalizeTestCases(testCases: RawTestCase[]): NormalizedTestCase[] {
  return testCases.map(tc => {
    let inputData: any;

    if (typeof tc.input !== 'undefined' && typeof tc.target !== 'undefined') {
      inputData = { input: tc.input, target: tc.target };
    } else if (typeof tc.target !== 'undefined') {
      inputData = { target: tc.target };
    } else {
      inputData = tc.input;
    }

    return {
      input: JSON.stringify(inputData),
      output: JSON.stringify(tc.output),
    };
  });
} 