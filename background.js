let tabActivity = {};
let extensionActivity = {}

const extensions_mapping = {
0:"youtube",
1:"reddit",
2:"returnyoutubedislike",
3:"others..."
}

browser.webRequest.onCompleted.addListener(
  (details) => {

    if (details.tabId === -1) {
      console.log('DEETS', details)
      for (let i = 0; i<((Object.keys(extensions_mapping).length)-1);i++)  {
        if (details.url.includes(extensions_mapping[i])) {
          extensionActivity[i] = extensionActivity[i]? extensionActivity[i]+1:1;
          break
        }
      }
      extensionActivity[3] = extensionActivity[3]? extensionActivity[3]+1:1;
    }
    else if (tabActivity[details.tabId]) {
      tabActivity[details.tabId]++;
    } else {
      tabActivity[details.tabId] = 1;
    }
  },
  {urls: ["<all_urls>"]}
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
  let totalActivity = Object.values(tabActivity).reduce((sum, count) => sum + count, 0);
  totalActivity += Object.values(extensionActivity).reduce((sum, count) => sum + count, 0);

  
  let results = await Promise.all(tabs.map(async (tab) => {
    let activity = tabActivity[tab.id] || 0;
    let percentage = totalActivity > 0 ? (activity / totalActivity) * 100 : 0;
    return {
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      percentage: percentage.toFixed(2)
    };
  }));

  let results2 = await Promise.all(Object.values(extensions_mapping).map(async (name, ind) => {
    let activity = extensionActivity[ind] || 0;
    let percentage = totalActivity > 0 ? (activity / totalActivity) * 100 : 0;
    return {
      title: name,
      favIconUrl: false,
      percentage: percentage.toFixed(2)
    };
  }));

  browser.runtime.sendMessage({action: "updatePopup", data: {results,results2}});
}

setInterval(() => {
  tabActivity = {};
  extensionActivity = {};
}, 120000);