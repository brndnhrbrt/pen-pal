import express from "express";

import * as generalController from "./general.controller.js";

const router = express.Router();

router.get("/getTargetDetails", generalController.getTargetDetails);

export default router;
