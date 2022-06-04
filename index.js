"use strict";

const express = require("express");
const app = express();
const port = 8010;

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

const buildSchemas = require("./src/schemas");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

db.serialize(() => {
  buildSchemas(db);

  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
  const app = require("./src/app")(db);
  app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
  app.listen(port, () =>
    console.log(`App started and listening on port ${port}`)
  );
});
