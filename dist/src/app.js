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
const app = (0, express_1.default)();
const body_parser_1 = __importDefault(require("body-parser"));
const jsonParser = body_parser_1.default.json();
const helpers_1 = require("./utils/helpers");
module.exports = (db) => {
    app.get("/health", (req, res) => res.send("Healthy"));
    app.post("/rides", jsonParser, (req, res) => {
        const payload = req.body;
        if (payload.start_lat < -90 ||
            payload.start_lat > 90 ||
            payload.start_long < -180 ||
            payload.start_long > 180) {
            return res.send({
                error_code: "VALIDATION_ERROR",
                message: "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
            });
        }
        if (payload.end_lat < -90 ||
            payload.end_lat > 90 ||
            payload.end_long < -180 ||
            payload.end_long > 180) {
            return res.send({
                error_code: "VALIDATION_ERROR",
                message: "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
            });
        }
        if (typeof payload.rider_name !== "string" || payload.rider_name.length < 1) {
            return res.send({
                error_code: "VALIDATION_ERROR",
                message: "Rider name must be a non empty string",
            });
        }
        if (typeof payload.driver_name !== "string" || payload.driver_name.length < 1) {
            return res.send({
                error_code: "VALIDATION_ERROR",
                message: "Rider name must be a non empty string",
            });
        }
        if (typeof payload.driver_vehicle !== "string" || payload.driver_vehicle.length < 1) {
            return res.send({
                error_code: "VALIDATION_ERROR",
                message: "Rider name must be a non empty string",
            });
        }
        var values = [
            payload.start_lat,
            payload.start_long,
            payload.end_lat,
            payload.end_long,
            (0, helpers_1.removeSpecialCharacters)(payload.rider_name.trim()),
            (0, helpers_1.removeSpecialCharacters)(payload.driver_name.trim()),
            (0, helpers_1.removeSpecialCharacters)(payload.driver_vehicle.trim()),
        ];
        try {
            return db.run("INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)", values, (err) => __awaiter(void 0, void 0, void 0, function* () {
                console.log(err);
                if (err) {
                    return res.send({
                        error_code: "SERVER_ERROR",
                        message: "Unknown error",
                    });
                }
                yield db.all("SELECT * FROM Rides order by rideID desc limit 1", (err, rows) => {
                    if (err) {
                        return res.send({
                            error_code: "SERVER_ERROR",
                            message: "Unknown error",
                        });
                    }
                    res.send(rows);
                });
            }));
        }
        catch (error) {
            console.log(error);
            return res.send({
                error_code: "SERVER_ERROR",
                message: "Unknown error",
            });
        }
    });
    app.get("/rides", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // pagination
        const page = req.query ? req.query.page : 0;
        const limit = req.query ? req.query.limit : 2;
        const offset = Number(page) * Number(limit);
        try {
            let results = null;
            results = yield new Promise((resolve, reject) => {
                db.all(`select * from Rides order by rideId asc limit ${limit} offset ${offset}`, (err, rows) => {
                    resolve(rows);
                });
            });
            if ((results === null || results === void 0 ? void 0 : results.length) === 0) {
                return res.send({
                    error_code: "RIDES_NOT_FOUND_ERROR",
                    message: "Could not find any rides",
                });
            }
            res.send({
                count: results && (results === null || results === void 0 ? void 0 : results.length),
                page: 1,
                limit: limit,
                data: results
            });
        }
        catch (error) {
            return res.send({
                error_code: "SERVER_ERROR",
                message: "Unknown error",
            });
        }
    }));
    app.get("/rides/:id", (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
            if (err) {
                return res.send({
                    error_code: "SERVER_ERROR",
                    message: "Unknown error",
                });
            }
            if (rows.length === 0) {
                return res.send({
                    error_code: "RIDES_NOT_FOUND_ERROR",
                    message: "Could not find any rides",
                });
            }
            res.send(rows);
        });
    });
    return app;
};
