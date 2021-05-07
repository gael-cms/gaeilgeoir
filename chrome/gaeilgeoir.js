const domain = window.location.hostname.split(".").slice(-2).join(".");
const mutationObserverConfig = { childList: true, subtree: true };

let siteTranslations = [], universalTranslations = [];
const unseenTranslations = new Set();

function filterNodes(node) {
    return node.textContent.trim() !== "" && ! ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName);
}

function translate(element) {
    let walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null,false);
    while(walk.nextNode())
        if (filterNodes(walk.currentNode))
           processTextNode(walk.currentNode);
}

function processTextNode(node) {
    const maybeTranslationRule = findTranslationRule(node.nodeValue.trim());
    if (maybeTranslationRule !== null) {
        node.nodeValue = node.nodeValue.replace(maybeTranslationRule.en, maybeTranslationRule.ga);
    }
}

function findTranslationRule(term) {
    const maybeSiteTranslation = siteTranslations.find(t => t.en === term);
    if (maybeSiteTranslation) return maybeSiteTranslation;

    const maybeUniversalTranslation = universalTranslations.find(t => t.en === term);
    if (maybeUniversalTranslation) return maybeUniversalTranslation;

    unseenTranslations.add(term);
    return null;
}

function readUniversalTranslations(callback) {
    chrome.storage.local.get('cache', function(result) {
        universalTranslations = result.cache;
        callback();
    });
}

function startTranslation() {
    mutationObserver.observe(document.body, mutationObserverConfig);
    translate(document.body);
}

const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(translate);
    });
});

function fetchDomainTranslations() {
    fetch("https://raw.githubusercontent.com/soceanainn/Gaeilgeoir/main/translations/" + domain + ".json")
        .then(function (response) {
            if (response.status !== 200) return readUniversalTranslations(startTranslation);
            response.json().then(function (data) {
                siteTranslations = data;
                readUniversalTranslations(startTranslation);
            });
        });
}

chrome.storage.sync.get(domain, function(result) {
    console.debug("GAEILGEOIR - hostname: " + domain + " was read as: " + result[domain]);
    if (result[domain] || result[domain] === undefined) {
        fetchDomainTranslations();
    }
});

chrome.runtime.sendMessage({pageLoad: true});
