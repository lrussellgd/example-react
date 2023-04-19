// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import {S3Client} from "@aws-sdk/client-s3";
import { DeveloperAuthenticatedCredentials } from "./models/developer-identity.js"
import { SessionDynamo, UserData, PlanData } from "./helpers/external-db-stores.js"

import validateAuthenticated from "./helpers/validate.js";
import applyAPIEndpoints from "./middleware/api-endpoints.js";

const PORT = parseInt((process.env.BACKEND_PORT) || (process.env.PORT), 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
var cogUsrCreds = {};


app.use("/api/*", validateAuthenticated());

app.use(express.json());
applyAPIEndpoints(app);



app.use(serveStatic(STATIC_PATH, { index: false }));


app.use("/*", async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);