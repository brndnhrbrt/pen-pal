const API_URL = "http://localhost:9001/api";

let TARGET_HOST = "";
let TARGET_URL = "";

let contextList = [];
let blockFeed = false;

async function clearVars() {
  const flag = await browser.storage.local.get("clearVars");
  console.log(!!flag && !!flag.clearVars);
  if (!!flag && !!flag.clearVars) {
    contextList = [];
    blockFeed = false;
    browser.storage.local.set({
      clearVars: "",
      aiFeed: JSON.stringify([]),
    });
    init();
  }
}

async function init() {
  // clear all storage
  await browser.storage.local.clear();

  // get target details from api
  await getTargetDetails();
}

async function getTargetDetails() {
  try {
    const response = await fetch(API_URL + "/general/getTargetDetails", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    const responseData = await response.json();

    if (responseData && responseData.targetDomain && responseData.targetUrl) {
      TARGET_HOST = responseData.targetDomain;
      TARGET_URL = responseData.targetUrl;
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 *  Send context data to the server for analysis by the LLM.
 *
 * @param {{
 * url: string,
 * context: string,
 * host: string
 * }} data
 */
async function sendContext(data) {
  try {
    await fetch(API_URL + "/ai/saveContext", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error(err);
  }
}

/**
 * Fetch AI feed data from the server and store it in local storage.
 */
async function aiFeed() {
  blockFeed = true;
  try {
    const response = await fetch(API_URL + "/ai/getAllContextSummaries", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterList: contextList,
      }),
    });

    const responseData = await response.json();

    const currentFeed = await browser.storage.local.get("aiFeed");
    if (currentFeed && currentFeed.aiFeed) {
      try {
        const parsedFeed = JSON.parse(currentFeed.aiFeed);
        console.log("parsedFeed", parsedFeed);
        if (parsedFeed && Array.isArray(parsedFeed)) {
          contextList.push(...parsedFeed.map((item) => item.url));
        }
      } catch (err) {
        console.error("Error parsing existing feed:", err);
      }
    }

    if (responseData && responseData.length > 0) {
      contextList.push(...responseData.map((item) => item.url));

      console.log("setting feed", responseData);

      await browser.storage.local.set({
        aiFeed: JSON.stringify(responseData),
      });
    }
  } catch (err) {
    console.error(err);
  }
  blockFeed = false;
}

/**
 * Listen for web requests from the target domain.
 */
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (
      !TARGET_HOST ||
      !TARGET_URL ||
      details.url.indexOf(TARGET_HOST) === -1
    ) {
      return;
    }
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const decoder = new TextDecoder("utf-8");
    let jsContent = "";

    filter.ondata = (event) => {
      const chunk = decoder.decode(event.data, { stream: true });
      jsContent += chunk;
      filter.write(event.data);
    };

    filter.onstop = () => {
      if (details.url.indexOf(TARGET_URL) === -1) {
        filter.disconnect();
        return;
      }
      if (!!jsContent) {
        sendContext({
          url: details.url,
          context: jsContent,
          host: TARGET_HOST,
        });
      }

      filter.disconnect();
    };

    return {};
  },
  {
    urls: ["<all_urls>"],
  },
  ["blocking"]
);

init()
  .then(() => {
    console.log("Initialization complete.");
  })
  .catch((err) => console.error("Error during initialization:", err));

setInterval(async () => {
  await clearVars();
  if (!blockFeed) {
    console.log("feed not blocked");
    await aiFeed();
  }
}, 1000);
