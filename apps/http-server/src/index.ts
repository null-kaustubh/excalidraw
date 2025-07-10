import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });

import express from "express";
import mainRouter from "./routes/auth";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api/v1", mainRouter);

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
