import express, { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);
const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  console.log("Received code execution request:", req.body);
  
  try {
    const { language_id, source_code } = req.body;

    if (!language_id || !source_code) {
      console.log("Missing required fields:", { language_id, source_code });
      res.status(400).json({ error: "Language ID and source code are required" });
      return;
    }

    // For now, we only support Python (language_id: 71)
    if (language_id !== 71) {
      console.log("Unsupported language ID:", language_id);
      res.status(400).json({ error: "Only Python is supported for now" });
      return;
    }

    // Create a temporary file with the source code
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `temp_${Date.now()}.py`);
    console.log("Creating temporary file:", tempFile);
    
    fs.writeFileSync(tempFile, source_code);

    try {
      console.log("Executing Python code...");
      // Run the Python code
      const { stdout, stderr } = await execAsync(`python "${tempFile}"`);
      console.log("Execution result:", { stdout, stderr });
      
      // Clean up the temporary file
      fs.unlinkSync(tempFile);
      console.log("Temporary file cleaned up");

      res.json({ stdout, stderr });
    } catch (error: any) {
      console.error("Code execution error:", error);
      // Clean up the temporary file even if there's an error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
        console.log("Temporary file cleaned up after error");
      }
      res.json({ 
        stderr: error.stderr || "An error occurred while running the code",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router; 