"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    console.log("Received code execution request:", req.body);
    try {
        const { language_id, source_code } = req.body;
        if (!language_id || !source_code) {
            console.log("Missing required fields:", { language_id, source_code });
            res.status(400).json({ error: "Language ID and source code are required" });
            return;
        }
        if (language_id !== 71) {
            console.log("Unsupported language ID:", language_id);
            res.status(400).json({ error: "Only Python is supported for now" });
            return;
        }
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFile = path.join(tempDir, `temp_${Date.now()}.py`);
        console.log("Creating temporary file:", tempFile);
        fs.writeFileSync(tempFile, source_code);
        try {
            console.log("Executing Python code...");
            const { stdout, stderr } = await execAsync(`python "${tempFile}"`);
            console.log("Execution result:", { stdout, stderr });
            fs.unlinkSync(tempFile);
            console.log("Temporary file cleaned up");
            res.json({ stdout, stderr });
        }
        catch (error) {
            console.error("Code execution error:", error);
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
                console.log("Temporary file cleaned up after error");
            }
            res.json({
                stderr: error.stderr || "An error occurred while running the code",
                error: error.message
            });
        }
    }
    catch (error) {
        console.error("Route error:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.default = router;
//# sourceMappingURL=run.js.map