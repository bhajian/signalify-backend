"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("./authMiddleware");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Unprotected Route
app.get("/hello", (req, res) => {
    res.json({ message: "Hello World!" });
});
// Protected Route
app.get("/protected", authMiddleware_1.authenticate, (req, res) => {
    res.json({ message: "Welcome to the protected route!", user: req.user });
});
app.get("/token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const code = req.query.code;
    if (!code) {
        res.status(400).json({ error: "Authorization code is missing" });
        return;
    }
    try {
        // Exchange code for tokens
        const tokenResponse = yield axios_1.default.post(process.env.COGNITO_TOKEN_URL, new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.COGNITO_CLIENT_ID,
            client_secret: process.env.COGNITO_CLIENT_SECRET,
            code: code,
            redirect_uri: process.env.COGNITO_REDIRECT_URI,
        }).toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const { id_token, access_token } = tokenResponse.data;
        res.status(200).json({ id_token, access_token });
    }
    catch (error) {
        console.error("Error exchanging code for tokens:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({
            error: "Failed to exchange code for tokens",
            details: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data,
        });
    }
}));
// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
