"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 8010;
const sqlite3_1 = __importDefault(require("sqlite3"));
sqlite3_1.default.verbose();
const db = new sqlite3_1.default.Database(":memory:");
const buildSchemas = require("./src/schemas");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("./swagger_output.json"));
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
        new winston_1.default.transports.File({ filename: "combined.log" }),
    ],
});
db.serialize(() => {
    buildSchemas(db);
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
    const app = require("./src/app")(db);
    app.use("/doc", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
    app.listen(port, () => console.log(`App started and listening on port ${port}`));
});
