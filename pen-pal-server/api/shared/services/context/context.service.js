import fs from "fs";
import path from "path";
import config from "config";

import constants from "../../../../constants/constants.js";
import chatService from "../chat/chat.service.js";

let isRunning = false;

const getContextList = async (host) => {
  // find all files in folder /data/context-files/{host}
  // return list of file names
  const folderPath = path.join("data", "context-files", host);
  if (!fs.existsSync(folderPath)) {
    return [];
  }
  // read the file CONTEXT_LIST.JSON in the folder
  const contextListFilePath = path.join(folderPath, "CONTEXT_LIST.JSON");
  if (fs.existsSync(contextListFilePath)) {
    const data = fs.readFileSync(contextListFilePath, "utf-8");
    return JSON.parse(data).contextList || [];
  }

  return [];
};

const getPendingContextList = async (host) => {
  // read the CONTEXT_SUMMARY.json file
  // compare with the CONTEXT_LIST.json file
  // return items from the CONTEXT_LIST that do not have a summary in CONTEXT_SUMMARY.json
  const folderPath = path.join("data", "context-summaries", host);
  const contextList = await getContextList(host);
  const contextSummaryFilePath = path.join(folderPath, "CONTEXT_SUMMARY.json");
  if (!fs.existsSync(contextSummaryFilePath)) {
    return contextList;
  }
  const data = fs.readFileSync(contextSummaryFilePath, "utf-8");
  const summaries = JSON.parse(data).summaries || [];
  const pendingContextList = contextList.filter((item) => {
    return !summaries.some((summary) => summary.url === item.url);
  });
  return pendingContextList;
};

const saveContext = async (host, url, context) => {
  // save the context to a file in folder /data/context-files/{host}/{url}
  // create the folder if it does not exist
  const folderPath = path.join("data", "context-files", host);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName =
    url.indexOf("/") !== -1
      ? url.split("/").pop()
      : new Date().getTime() + ".js";

  const filterList = constants.FILE_FILTER;

  // skip files that match the filter list
  if (filterList.some((filter) => fileName.indexOf(filter) !== -1)) {
    return;
  }

  const uniqueFileName = `${new Date().getTime()}`;

  // appent to CONTEXT_LIST.JSON.
  // use this format: { fileName: uniqueFileName, url: url }
  const contextListFilePath = path.join(folderPath, "CONTEXT_LIST.JSON");
  let contextList = [];
  if (fs.existsSync(contextListFilePath)) {
    const data = fs.readFileSync(contextListFilePath, "utf-8");
    contextList = JSON.parse(data).contextList || [];
  }

  // if an item with the same url already exists exit the function
  if (contextList.some((item) => item.url === url)) {
    return;
  }

  contextList.push({ fileName: uniqueFileName, url: url });

  const contextListData = { contextList };
  fs.writeFileSync(
    contextListFilePath,
    JSON.stringify(contextListData, null, 2)
  );

  // save the context to a file named fileName
  const filePath = path.join(folderPath, uniqueFileName);
  await fs.writeFileSync(filePath, context);
};

const getContextSummary = async (host, url) => {
  // read the CONTEXT_SUMMARY.json file in folder /data/context-summaries/{host}
  // return the summary for the given url
  const folderPath = path.join("data", "context-summaries", host);
  const filePath = path.join(folderPath, "CONTEXT_SUMMARY.json");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, "utf-8");
  const summaries = JSON.parse(data).summaries || [];
  const summary = summaries.find((s) => s.url === url);
  return summary ? summary.summary : null;
};

const getAllContextSummaries = async (host, filterList) => {
  // read the CONTEXT_SUMMARY.json file in folder /data/context-summaries/{host}
  // return all summaries
  const folderPath = path.join("data", "context-summaries", host);
  const filePath = path.join(folderPath, "CONTEXT_SUMMARY.json");
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, "utf-8");
  const summaries = JSON.parse(data).summaries || [];
  return summaries
    .filter((summary) => filterList.indexOf(summary.url) === -1)
    .map((summary) => ({
      url: summary.url,
      summary: summary.summary,
    }));
};

const saveContextSummary = async (host, url, summary) => {
  // CONTEXT_SUMMARY.json will contain an object with an array "summaries".
  // each entry in the array will have the following structure:
  // {
  //   "url": "https://example.com",
  //   "summary": "This is a summary of the context."
  // }
  const folderPath = path.join("data", "context-summaries", host);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const fileName = "CONTEXT_SUMMARY.json";
  const filePath = path.join(folderPath, fileName);
  let summaries = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    summaries = JSON.parse(data).summaries || [];
  }
  summaries.push({ url, summary });
  const summaryData = { summaries };
  fs.writeFileSync(filePath, JSON.stringify(summaryData, null, 2));
  return summaryData;
};

const contextLoop = async (host) => {
  if (isRunning) {
    console.log("Context loop is already running.");
    return;
  }

  isRunning = true;

  // get pending context list
  // get the first item from the list
  // call async function "PLACEHOLDER_FUNCTION" to analyze the context
  // call saveContextSummary

  const pendingContextList = await getPendingContextList(host);
  if (pendingContextList.length === 0) {
    console.log("No pending context to analyze.");
    isRunning = false;
    return;
  }
  console.log(`Analyzing ${pendingContextList.length} pending contexts...`);
  for (const item of pendingContextList) {
    const { url, fileName } = item;
    console.log(`Analyzing context for URL: ${url}`);

    // get file contents for the given URL
    const folderPath = path.join("data", "context-files", host);
    const filePath = path.join(folderPath, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found for URL: ${url}`);
      continue;
    }
    const context = fs.readFileSync(filePath, "utf-8");

    // Placeholder for the actual analysis function
    const analysisResult = await chatService.chatGPT(
      `The web request ${url} resulted in the following response: ${context}`
    );
    // const analysisResult = `Analysis result for ${url}`; // Mock result

    // Save the summary
    await saveContextSummary(host, url, analysisResult);
  }

  isRunning = false;
};

setInterval(() => {
  contextLoop(config.get("TARGET_HOST"));
}, 1000);

const contextService = {
  getContextList,
  saveContext,
  getContextSummary,
  saveContextSummary,
  getAllContextSummaries,
};

export default contextService;
