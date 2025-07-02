import express from "express";

import * as aiController from "./ai.controller.js";

const router = express.Router();

router.get("/contextList", aiController.getContextList);
router.post("/saveContext", aiController.saveContext);
router.get("/contextSummary", aiController.getContextSummary);
router.post("/getAllContextSummaries", aiController.getAllContextSummaries);
router.post("/saveContextSummary", aiController.saveContextSummary);

export default router;
