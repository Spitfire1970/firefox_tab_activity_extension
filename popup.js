document.getElementById('refreshButton').addEventListener('click', requestActivityData);

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "updatePopup") {
    updatePopup(message.data);
  }
});

function updatePopup(data) {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = '';
  const resultsList2 = document.getElementById('resultsList2');
  resultsList2.innerHTML = '';
  
  let hasActivity = false;
  data.results.forEach(item => {
    if (parseFloat(item.percentage) > 0) {
      hasActivity = true;
      const li = document.createElement('li');
      li.innerHTML = `
        <img class="favicon" src="${item.favIconUrl || 'default-favicon.svg'}" alt="Favicon">
        <span class="tab-title">${item.title}</span>
        <span class="tab-percentage">${item.percentage}%</span>
      `;
      resultsList.appendChild(li);
    }
  });

  let hasActivity2 = false;
  data.results2.forEach(item => {
    if (parseFloat(item.percentage) > 0) {
      hasActivity2 = true;
      const li = document.createElement('li');
      li.innerHTML = `
        <img class="favicon" src="${item.favIconUrl || 'default-favicon.svg'}" alt="Favicon">
        <span class="tab-title">${item.title}</span>
        <span class="tab-percentage">${item.percentage}%</span>
      `;
      resultsList2.appendChild(li);
    }
  });

  if (!hasActivity) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="tab-title"> No active tabs at the moment. </span>`;
    resultsList.appendChild(li);
  }
  if (!hasActivity2) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="tab-title"> No active extensions at the moment. </span>`;
    resultsList2.appendChild(li);
  }
}

function requestActivityData() {
  browser.runtime.sendMessage({action: "getActivity"});
}

// Request initial data when popup opens
requestActivityData();

// Set up auto-refresh when the popup is opened
document.addEventListener('DOMContentLoaded', requestActivityData);