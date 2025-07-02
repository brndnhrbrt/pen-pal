import express from "express";
import morgan from "morgan";
import cors from "cors";
import config from "config";

import router from "./api/secure/router.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", router);

const PORT = process.env.PORT || config.get("PORT");

// @ts-ignore
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
