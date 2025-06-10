// utils/runCode.ts
import axios from "axios";
import api from "@/lib/api";

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
    const response = await api.post("/run", { language_id, source_code });
    return response.data;
  } catch (error) {
    console.error('Error running code:', error);
    throw error;
  }
}
