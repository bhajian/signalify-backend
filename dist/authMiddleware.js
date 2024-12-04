"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = (0, jwks_rsa_1.default)({
    jwksUri: `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});
const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err);
        }
        else {
            const signingKey = key === null || key === void 0 ? void 0 : key.getPublicKey();
            callback(null, signingKey);
        }
    });
};
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Token missing" });
        return;
    }
    jsonwebtoken_1.default.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.user = decoded; // Assign the decoded token to the user property
        next();
    });
};
exports.authenticate = authenticate;
