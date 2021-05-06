const domain = window.location.hostname.split(".").slice(-2).join(".");
const mutationObserverConfig = { childList: true, subtree: true };

let siteTranslations = [];
const unseenTranslations = new Set();

function toSentences(text){
    return text.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|").filter(str => str.trim() !== "");
}

function leftTrim(str) { return str.replace(/^\s+/,"");}
function rightTrim(str) { return str.replace(/\s+$/,"");}

function filterNodes(node){
    return node.textContent.trim() !== "" && ! ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName);
}

function translate(element){
    let walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null,false);
    while(walk.nextNode())
        if (filterNodes(walk.currentNode))
           processTextNode(walk.currentNode);
}

function processTextNode(node){
    const sentences = toSentences(node.nodeValue);
    const translatedSentences = [];

    sentences.forEach(sentence => translatedSentences.push(maybeConvertSentence(sentence.trim())));

    let output = translatedSentences.join(" ");
    if (leftTrim(node.nodeValue).length !== node.nodeValue.length) output = " " + output;
    if (rightTrim(node.nodeValue).length !== node.nodeValue.length) output += " ";

    node.nodeValue = output
}

function maybeConvertSentence(sentence){
    const maybeSiteTranslation = siteTranslations.find(t => t.en === sentence);
    if (maybeSiteTranslation) return maybeSiteTranslation.ga;

    const maybeUniversalTranslation = universalTranslations.find(t => t.en === sentence);
    if (maybeUniversalTranslation) return maybeUniversalTranslation.ga;

    unseenTranslations.add(sentence);
    return sentence;
}

function startTranslation(){
    mutationObserver.observe(document.body, mutationObserverConfig);
    translate(document.body);
}

const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(translate);
    });
});

const xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    try {
        if (this.readyState === 4 && this.status === 200) {
            // Typical action to be performed when the document is ready:
            siteTranslations = JSON.parse(xhttp.responseText);
            startTranslation();
        } else if (this.readyState === 4) {
            startTranslation();
        }
    } catch (err){
        console.error("GAEILGEOIR - Error with Gaeilgeoir extension: " + err);
    }
};

chrome.storage.sync.get(domain, function(result) {
    console.debug("GAEILGEOIR - hostname: " + domain + " read as: " + result[domain]);
    if (result[domain] || result[domain] === undefined) {
        xhttp.open("GET", "https://raw.githubusercontent.com/soceanainn/Gaeilgeoir/main/translations/" + domain + ".json", true);
        xhttp.send();
    }
});

chrome.runtime.sendMessage({pageLoad: true});
