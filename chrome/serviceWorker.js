const actionContext = chrome.runtime.getManifest().manifest_version === 3 ? 'action' : 'browser_action';
function actionAPI(){ return chrome.runtime.getManifest().manifest_version === 3 ? chrome.action : chrome.browserAction; }

function updateIcon(tab, isUpdate = true){
    let url = tab.url || tab.pendingUrl;
    let domain = new URL(url).hostname.split(".").slice(-2).join(".");
    chrome.storage.sync.get(domain, function(result) {
        console.debug("HOSTNAME: " + domain + " read as: " + result[domain]);
        if (result[domain] === undefined) result[domain] = true;
        if (isUpdate){
            chrome.storage.sync.set({[domain]: !result[domain]}, function(){
                console.debug("HOSTNAME: " + domain + " updated to: " + !result[domain]);
                const imagePath = !result[domain] ? '/images/icon16.png' : '/images/icon16-inactive.png';
                actionAPI().setIcon({path: imagePath, tabId: tab.id}, () => { chrome.runtime.lastError });
                chrome.tabs.reload(tab.id);
            });
        } else {
            const imagePath = result[domain] ? '/images/icon16.png' : '/images/icon16-inactive.png';
            actionAPI().setIcon({path: imagePath, tabId: tab.id}, () => { chrome.runtime.lastError });
        }
    });
}

actionAPI().onClicked.addListener(updateIcon);
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.pageLoad) updateIcon(sender.tab, false);
});

function updateUniversalTranslationCache() {
    fetch("https://raw.githubusercontent.com/gael-cms/Gaeilgeoir/main/translations/universal.json")
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
        contexts: [ actionContext ],
        id: 'about',
        title: 'Eolas ar an tionscnamh seo | About this project'
    }, function(){
        chrome.contextMenus.onClicked.addListener(function(info) {
            if (info.menuItemId === 'about') chrome.tabs.create({ active: true, url: 'https://gaelcms.com/extensions/gaeilgeoir' });
        });
    });
    chrome.contextMenus.create({
        contexts: [ actionContext ],
        id: 'gael-cms',
        title: 'Eolas fúinn | About GaelCMS'
    }, function(){
        chrome.contextMenus.onClicked.addListener(function(info) {
            if (info.menuItemId === 'gael-cms') chrome.tabs.create({ active: true, url: 'https://gaelcms.com' });
        });
    });
    chrome.contextMenus.create({
        contexts: [ actionContext ],
        id: 'support',
        title: 'Tacaigh linn | Support this project'
    }, function(){
        chrome.contextMenus.onClicked.addListener(function(info) {
            if (info.menuItemId === 'support') chrome.tabs.create({ active: true, url: 'https://ko-fi.com/gaelcms' });
        });
    });
});

updateUniversalTranslationCache();
setInterval(updateUniversalTranslationCache, 24 * 60 * 60 * 1000);
