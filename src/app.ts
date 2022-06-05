import express from "express";
const app = express();

import bodyParser from "body-parser";
const jsonParser = bodyParser.json();

import { Ride } from "./interface/ride.interface";
import { RideLists } from "./interface/ride-lists.interface";

module.exports = (db: any) => {
  app.get("/health", (req, res) => res.send("Healthy"));

  app.post("/rides", jsonParser, (req, res) => {
    const payload: Ride = req.body; 
    
    if (
      payload.start_lat < -90 ||
      payload.start_lat > 90 ||
      payload.start_long < -180 ||
      payload.start_long > 180
    ) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message:
          "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
      });
    }

    if (
      payload.end_lat < -90 ||
      payload.end_lat > 90 ||
      payload.end_long < -180 ||
      payload.end_long > 180
    ) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message:
          "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
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
      payload.rider_name,
      payload.driver_name,
      payload.driver_vehicle,
    ];

    try {
      return db.run(
        "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)",
        values,
        async (err: any) => {
          console.log(err)
          if (err) {
            return res.send({
              error_code: "SERVER_ERROR",
              message: "Unknown error",
            });
          }
  
          await db.all(
            "SELECT * FROM Rides order by rideID desc limit 1",
            (err: any, rows: RideLists) => {
              if (err) {
                return res.send({
                  error_code: "SERVER_ERROR",
                  message: "Unknown error",
                });
              }
  
              res.send(rows);
            }
          );
        }
      );
    } catch(error) {
      console.log(error)
      return res.send({
        error_code: "SERVER_ERROR",
        message: "Unknown error",
      });
    }
    
  });

  app.get("/rides", async (req, res) => {
    // pagination
    const page = req.query ? req.query.page : 0;
    const limit = req.query ? req.query.limit : 2;
    const offset = Number(page) * Number(limit);

    try {
        let results: any = null;
        results = await new Promise((resolve, reject) => {
            db.all(`select * from Rides order by rideId asc limit ${limit} offset ${offset}`, (err: any, rows: any) => {
                resolve(rows);
            });
        });
        
        if (results?.length === 0) {
            return res.send({
                error_code: "RIDES_NOT_FOUND_ERROR",
                message: "Could not find any rides",
            });
        }

      res.send({
          count: results && results?.length,
          page: 1,
          limit: limit,
          data: results as RideLists
      });
    } catch(error) {
        return res.send({
            error_code: "SERVER_ERROR",
            message: "Unknown error",
        });
    }
  });

  app.get("/rides/:id", (req, res) => {
    db.all(
      `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
      (err: any, rows: any) => {
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
      }
    );
  });

  return app;
};
