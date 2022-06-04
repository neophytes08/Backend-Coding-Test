'use strict';

const express = require('express');
const app = express();
const port = 8010;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require('./swagger_output.json')


db.serialize(() => {
    buildSchemas(db);
    
    const app = require('./src/app')(db);
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
    app.listen(port, () => console.log(`App started and listening on port ${port}`));
});