let tabActivity = {};
let extensionActivity = {};

// Listen for all web requests
browser.webRequest.onCompleted.addListener(
  (details) => {
    if (details.tabId === -1) {
      // This request is not associated with a tab, likely from an extension
      let originUrl = details.originUrl || details.initiator;
      if (originUrl && originUrl.startsWith('moz-extension://')) {
        let extensionId = originUrl.split('/')[2];
        extensionActivity[extensionId] = (extensionActivity[extensionId] || 0) + 1;
      }
    } else {
      // This is a regular tab request
      tabActivity[details.tabId] = (tabActivity[details.tabId] || 0) + 1;
    }
  },
  {urls: ["<all_urls>"]},
  ["responseHeaders"]
);

browser.tabs.onRemoved.addListener((tabId) => {
  delete tabActivity[tabId];
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getActivity") {
    analyzeTabActivity();
  }
});

async function analyzeTabActivity() {
  let tabs = await browser.tabs.query({currentWindow: true});
  let totalTabActivity = Object.values(tabActivity).reduce((sum, count) => sum + count, 0);
  let totalExtensionActivity = Object.values(extensionActivity).reduce((sum, count) => sum + count, 0);
  let totalActivity = totalTabActivity + totalExtensionActivity;

  let results = await Promise.all(tabs.map(async (tab) => {
    let activity = tabActivity[tab.id] || 0;
    let percentage = totalActivity > 0 ? (activity / totalActivity) * 100 : 0;

    return {
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      activityPercentage: percentage.toFixed(2)
    };
  }));

  // Add an entry for extension activity
  let extensionPercentage = totalActivity > 0 ? (totalExtensionActivity / totalActivity) * 100 : 0;
  results.push({
    title: "Extension Activity",
    favIconUrl: "watermark.png", // You'll need to provide this icon
    activityPercentage: extensionPercentage.toFixed(2)
  });

  browser.runtime.sendMessage({action: "updatePopup", data: results});
}

// Periodically clear old data to prevent memory bloat
setInterval(() => {
  tabActivity = {};
  extensionActivity = {};
}, 300000); // Clear every 5 minutes