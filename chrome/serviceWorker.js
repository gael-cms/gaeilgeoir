function generateIcon(isEnabled){
    const size = 16;
    const textScaling = 0.8;
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, size, size);
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2.0);
    if (isEnabled) context.fillStyle = '#537a5a';
    else context.fillStyle = '#909590';
    context.fill();
    context.font = (size * textScaling) + 'px Arial';
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = 'hanging';
    const capHeightRatio = 0.72; // for Arial
    context.fillText('G', size / 2, (size - (size * textScaling * capHeightRatio)) / 2.0);
    return context.getImageData(0, 0, size, size);
}

function updateIcon(tab, isUpdate = true){
    let url = tab.url || tab.pendingUrl;
    let domain = new URL(url).hostname.split(".").slice(-2).join(".");
    chrome.storage.sync.get(domain, function(result) {
        console.debug("HOSTNAME: " + domain + " read as: " + result[domain]);
        if (result[domain] === undefined) result[domain] = true;
        if (isUpdate){
            chrome.storage.sync.set({[domain]: !result[domain]}, function(){
                console.debug("HOSTNAME: " + domain + " updated to: " + !result[domain]);
                const imageData = generateIcon(!result[domain]);
                chrome.action.setIcon({imageData: imageData, tabId: tab.id}, () => { chrome.runtime.lastError });
                chrome.tabs.reload(tab.id);
            });
        } else {
            const imageData = generateIcon(result[domain]);
            chrome.action.setIcon({imageData: imageData, tabId: tab.id}, () => { chrome.runtime.lastError });
        }
    });
}

chrome.action.onClicked.addListener(updateIcon);
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.pageLoad) updateIcon(sender.tab, false);
});

function updateUniversalTranslationCache() {
    fetch("https://raw.githubusercontent.com/soceanainn/Gaeilgeoir/main/translations/universal.json")
        .then(function (response) {
            if (response.status !== 200) {
                console.error('Request for universal translations failed with status: ' + response.status);
                return;
            }

            response.json().then(function (data) {
                chrome.storage.local.set({cache: data});
            });
        });
}

chrome.contextMenus.removeAll(function(){
    chrome.contextMenus.create({
        contexts: ['page'],
        id: 'download_translations',
        title: 'Download translation template file'
    }, function(){
        chrome.contextMenus.onClicked.addListener(function(info, tab) {
            if (info.menuItemId === 'download_translations') chrome.tabs.sendMessage(tab.id, {"exportTranslations": true});
        });
    });
    chrome.contextMenus.create({
        contexts: ['action'],
        id: 'about',
        title: 'More info'
    }, function(){
        chrome.contextMenus.onClicked.addListener(function(info, tab) {
            if (info.menuItemId === 'about') chrome.tabs.sendMessage(tab.id, {"showDocs": true});
        });
    });
    chrome.contextMenus.create({
        contexts: ['action'],
        id: 'support',
        title: 'Support this project'
    }, function(){
        chrome.contextMenus.onClicked.addListener(function(info, tab) {
            if (info.menuItemId === 'support') chrome.tabs.sendMessage(tab.id, {"support": true});
        });
    });
});

updateUniversalTranslationCache();
setInterval(updateUniversalTranslationCache, 24 * 60 * 60 * 1000);
