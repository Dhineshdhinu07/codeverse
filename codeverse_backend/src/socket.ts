import { Server } from "socket.io";
import { runInSandbox } from "./utils/runInSandbox";
import { runJudge } from "./utils/runJudge";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TestCase {
  input: string;
  expectedOutput: string;
}

export function setupBattleSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on("battle:submit", async (data) => {
      const { problemId, code, language, roomId, userId } = data;

      try {
        // Run judge logic
        const problem = await prisma.problem.findUnique({ where: { id: problemId } });
        if (!problem) {
          socket.emit("battle:error", { message: "Problem not found" });
          return;
        }

        // Parse test cases and validate their structure
        const testCases = problem.testCases as unknown as TestCase[];
        if (!testCases || !Array.isArray(testCases)) {
          socket.emit("battle:error", { message: "Invalid test cases format" });
          return;
        }

        const results = [];

        for (const testCase of testCases) {
          if (!testCase.input || !testCase.expectedOutput) {
            socket.emit("battle:error", { message: "Invalid test case format" });
            return;
          }

          const inputData = testCase.input;
          const expectedOutput = testCase.expectedOutput;
          const result = await runInSandbox(code, inputData);
          const passed = runJudge(result, expectedOutput);
          
          results.push({
            input: inputData,
            expected: expectedOutput,
            actual: result,
            passed
          });

          if (!passed) {
            break;
          }
        }

        const allPassed = results.every(r => r.passed);

        if (allPassed) {
          // First correct submission wins
          io.to(roomId).emit("battle:result", { 
            winnerId: userId,
            results
          });
        } else {
          socket.emit("battle:fail", { results });
        }
      } catch (err) {
        console.error("Battle submission error:", err);
        socket.emit("battle:error", { 
          message: err instanceof Error ? err.message : "Unknown error"
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
} 