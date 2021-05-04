const universalTranslations = [
    // General - Ginearálta
    {"en": "Home", "ga": "Baile"},
    {"en": "About Me", "ga": "Eolas Fúm"},
    {"en": "About me", "ga": "Eolas fúm"},
    {"en": "Info", "ga": "Eolas"},
    {"en": "More Info", "ga": "Tuilleadh Eolais"},
    {"en": "Contact", "ga": "Teagmháil"},
    {"en": "Contact Me", "ga": "Déan Teagmháil Liom"},
    {"en": "Contact Us", "ga": "Déan Teagmháil Linn"},
    {"en": "Jobs", "ga": "Postanna"},
    {"en": "Account", "ga": "Cuntas"},
    {"en": "Privacy", "ga": "Príobháideachas"},
    {"en": "Cookie Preferences", ga: "Roghanna Fianáin"},
    {"en": "Cookies", ga: "Fianáin"}
];

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

function translate(el){
    let walk = document.createTreeWalker(el,NodeFilter.SHOW_TEXT, null,false);
    while(walk.nextNode())
        if (filterNodes(walk.currentNode))
           processTextNode(walk.currentNode);
}

function processTextNode(abc){
    const sentences = toSentences(abc.nodeValue);
    const translatedSentences = [];

    sentences.forEach(abc => translatedSentences.push(maybeConvertSentence(abc.trim())));

    let output = translatedSentences.join(" ");
    if (leftTrim(abc.nodeValue).length !== abc.nodeValue.length) output = " " + output;
    if (rightTrim(abc.nodeValue).length !== abc.nodeValue.length) output += " ";

    abc.nodeValue = output
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

function exportTranslations(){
    const link = document.createElement('a');
    let exportData = 'data:text/csv;charset=utf-8,';

    exportData += 'Béarla,Gaeilge\n';
    siteTranslations.forEach(t => exportData += '"' + t.en +'","' + t.ga + '"\n');
    Array.from(unseenTranslations).sort((a,b) => a.length - b.length).forEach(t => exportData += '"' + t +'"\n');

    link.download = domain + ".csv";
    link.href = encodeURI(exportData);
    link.click();
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
        xhttp.open("GET", "https://raw.githubusercontent.com/emmad194/Gaeilgeoir/main/translations/" + domain + ".json", true);
        xhttp.send();
    }
});

chrome.runtime.sendMessage({pageLoad: true});
