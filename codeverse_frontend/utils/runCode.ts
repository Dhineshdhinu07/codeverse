// utils/runCode.ts
import axios from "axios";

type RunCodeParams = {
  language_id: number;
  source_code: string;
};

type RunCodeResult = {
  stdout?: string;
  stderr?: string;
};

export async function runCode({ language_id, source_code }: RunCodeParams): Promise<RunCodeResult> {
  try {
    const response = await fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language_id,
        source_code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to run code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error running code:', error);
    throw error;
  }
}
