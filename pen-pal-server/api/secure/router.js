import express from "express";

import aiRouter from "./ai/ai.router.js";
import generalRouter from "./general/general.router.js";

const router = express.Router();

router.use("/ai", aiRouter);
router.use("/general", generalRouter);

export default router;
