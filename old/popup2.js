document.getElementById('refreshButton').addEventListener('click', requestActivityData);

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "updatePopup") {
        updatePopup(message.data);
    }
});

function updatePopup(data) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    let hasActivity = false;

    data.forEach(item => {
        if (parseFloat(item.activityPercentage) > 0) {
            hasActivity = true;
            const li = document.createElement('li');
            li.innerHTML = `
                <img class="favicon" src="${item.favIconUrl || 'default-favicon.png'}" alt="Favicon">
                <span class="tab-title">${item.title}</span>
                <div class="tab-stats">
                    <span class="tab-activity">Activity: ${item.activityPercentage}%</span>
                </div>
            `;
            resultsList.appendChild(li);
        }
    });

    if (!hasActivity) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="tab-title">No active tabs at the moment.</span>`;
        resultsList.appendChild(li);
    }
}

function requestActivityData() {
    browser.runtime.sendMessage({action: "getActivity"});
}

requestActivityData();

document.addEventListener('DOMContentLoaded', requestActivityData);