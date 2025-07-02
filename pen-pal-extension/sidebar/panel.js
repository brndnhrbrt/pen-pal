let myWindowId;
const contentBox = document.querySelector("#content");
const clearStorageButton = document.querySelector("#clearStorage");
const collapseButton = document.querySelector("#collapse");
const expandButton = document.querySelector("#expand");

let historyArr = [];

browser.storage.local.clear();

/*
Update the sidebar's content.

1) Get the active tab in this sidebar's window.
2) Get its stored content.
3) Put it in the content box.
*/
function updateContent() {
  browser.tabs
    .query({ windowId: myWindowId, active: true })
    .then((tabs) => {
      return browser.storage.local.get(tabs[0].url);
    })
    .then((storedInfo) => {
      contentBox.textContent = storedInfo[Object.keys(storedInfo)[0]];
    });
}

/*
Update content when a new tab becomes active.
*/
browser.tabs.onActivated.addListener(updateContent);

/*
Update content when a new page is loaded into a tab.
*/
browser.tabs.onUpdated.addListener(updateContent);

/*
When the sidebar loads, get the ID of its window,
and update its content.
*/
browser.windows.getCurrent({ populate: true }).then((windowInfo) => {
  myWindowId = windowInfo.id;
  updateContent();
});

const addToBox = (data) => {
  if (contentBox && data && data.length) {
    // hide the element with id "no-content"
    const noContent = document.querySelector("#no-content");
    if (noContent) {
      noContent.style.display = "none";
    }
    data.forEach((item) => {
      if (
        historyArr.map((historyItem) => historyItem.url).indexOf(item.url) ===
        -1
      ) {
        const html = marked.parse(item.summary);
        const summaryHTML = `<div class="ai-feed-item"><h1 class="ai-item-title" id="ai-item-title">${item.url} summary</h1>${html}</div>`;
        historyArr.push({
          url: item.url,
          summary: summaryHTML,
        });
        contentBox.innerHTML += `<br>${summaryHTML}`;
      }
    });

    // contentBox.innerHTML = historyArr.map((item) => item.summary).join("<br>");
  }
};

setInterval(async () => {
  const data = await browser.storage.local.get("aiFeed");
  try {
    const feed = JSON.parse(JSON.parse(JSON.stringify(data)).aiFeed);

    console.log("feed", feed);

    addToBox(feed);

    await browser.storage.local.set({
      aiFeed: JSON.stringify([]),
    });
  } catch (err) {
    console.error(err);
  }
}, 1000);

const collapseAll = () => {
  console.log("collapsing all");
  document.querySelectorAll(".ai-feed-item").forEach((item) => {
    if (!item.classList.contains("collapsed")) {
      item.classList.add("collapsed");
    }
  });
};

const expandAll = () => {
  console.log("expanding all");
  document.querySelectorAll(".ai-feed-item").forEach((item) => {
    if (item.classList.contains("collapsed")) {
      item.classList.remove("collapsed");
    }
  });
};

setTimeout(() => {
  if (clearStorageButton) {
    clearStorageButton.addEventListener("click", clearStorage);
  }
  if (collapseButton) {
    collapseButton.addEventListener("click", collapseAll);
  }
  if (expandButton) {
    expandButton.addEventListener("click", expandAll);
  }
  init();
}, 100);

const clearStorage = () => {
  if (contentBox) {
    browser.storage.local.set({
      aiFeed: "",
      clearVars: "1",
    });
    contentBox.innerHTML = "";
    historyArr = [];
  }
  const noContent = document.querySelector("#no-content");
  if (noContent) {
    noContent.style.display = "block";
  }
};

const init = () => {
  clearStorage();

  if (!contentBox) {
    return;
  }
  contentBox.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target.classList.contains("ai-item-title") ||
      target.closest(".ai-item-title")
    ) {
      const item = target.classList.contains("ai-feed-item")
        ? target
        : target.closest(".ai-feed-item");
      item.classList.toggle("collapsed");
    }
  });

  const noContent = document.querySelector("#no-content");
  if (noContent) {
    noContent.style.visibility = "visible";
  }
};

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  clearStorage();
});
