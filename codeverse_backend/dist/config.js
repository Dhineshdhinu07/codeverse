"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_ORIGIN = exports.PORT = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
exports.PORT = process.env.PORT || 5000;
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
//# sourceMappingURL=config.js.map