document.getElementById('refreshButton').addEventListener('click', requestActivityData);

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "updatePopup") {
        updatePopup(message.data);
    }
});

function createListItem(item) {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.className = 'favicon';
    img.src = item.favIconUrl || 'default-favicon.svg';
    img.alt = 'Favicon';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'tab-title';
    titleSpan.textContent = item.title;

    const percentageSpan = document.createElement('span');
    percentageSpan.className = 'tab-percentage';
    percentageSpan.textContent = `${item.percentage}%`;

    li.appendChild(img);
    li.appendChild(titleSpan);
    li.appendChild(percentageSpan);

    return li;
}

function updatePopup(data) {
    const resultsList = document.getElementById('resultsList');
    const resultsList2 = document.getElementById('resultsList2');

    resultsList.innerHTML = '';
    resultsList2.innerHTML = '';

    let hasActivity = false;
    data.results.forEach(item => {
        if (parseFloat(item.percentage) > 0) {
            hasActivity = true;
            resultsList.appendChild(createListItem(item));
        }
    });

    let hasActivity2 = false;
    data.results2.forEach(item => {
        if (parseFloat(item.percentage) > 0) {
            hasActivity2 = true;
            resultsList2.appendChild(createListItem(item));
        }
    });

    if (!hasActivity) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.className = 'tab-title';
        span.textContent = 'No active tabs at the moment.';
        li.appendChild(span);
        resultsList.appendChild(li);
    }

    if (!hasActivity2) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.className = 'tab-title';
        span.textContent = 'No active extensions at the moment.';
        li.appendChild(span);
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