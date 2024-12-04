"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hello_1 = __importDefault(require("./routes/hello"));
const token_1 = __importDefault(require("./routes/token"));
const protected_1 = __importDefault(require("./routes/protected"));
const app = (0, express_1.default)();
// Use routes
app.use("/hello", hello_1.default); // All /helloworld routes
app.use("/token", token_1.default); // All /token routes
app.use("/protected", protected_1.default); // All /protected routes
exports.default = app;
