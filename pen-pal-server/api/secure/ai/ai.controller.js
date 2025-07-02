import config from "config";

import contextService from "../../shared/services/context/context.service.js";

export const getContextList = async (req, res) => {
  try {
    const contextList = await contextService.getContextList(
      config.get("TARGET_HOST")
    );
    res.json(contextList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const saveContext = async (req, res) => {
  try {
    const { url, context } = req.body;
    if (!url || !context) {
      return res.status(400).json({ message: "URL and context are required." });
    }
    const savedContext = await contextService.saveContext(
      config.get("TARGET_HOST"),
      url,
      context
    );
    res.json(savedContext);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const getContextSummary = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: "URL is required." });
    }
    const summary = await contextService.getContextSummary(
      config.get("TARGET_HOST"),
      url
    );
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const saveContextSummary = async (req, res) => {
  try {
    const { url, summary } = req.body;
    if (!url || !summary) {
      return res.status(400).json({ message: "URL and summary are required." });
    }
    const savedSummary = await contextService.saveContextSummary(
      config.get("TARGET_HOST"),
      url,
      summary
    );
    res.json(savedSummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

export const getAllContextSummaries = async (req, res) => {
  try {
    const { filterList = [] } = req.body;

    const summaries = await contextService.getAllContextSummaries(
      config.get("TARGET_HOST"),
      filterList
    );
    res.json(summaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};
