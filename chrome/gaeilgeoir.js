const ignoredWebsites = [
    "tearma.ie",
    "focloir.ie",
    "teanglann.ie",
    "facebook.com"
];

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

let siteTranslations = [];
const unseenTranslations = new Set();

function toSentences(text){
    return text.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|").filter(str => str.trim() !== "");
}

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
    const output = [];

    sentences.forEach(abc => output.push(maybeConvertSentence(abc.trim())));
    if (abc.nodeValue.trim().length !== abc.nodeValue.length){
        abc.nodeValue = output.join(" ") + " ";
    } else {
        abc.nodeValue = output.join(" ")
    }
}

function maybeConvertSentence(sentence){
    const maybeSiteTranslation = siteTranslations.find(t => t.en === sentence);
    if (maybeSiteTranslation) return maybeSiteTranslation.ga;

    const maybeUniversalTranslation = universalTranslations.find(t => t.en === sentence);
    if (maybeUniversalTranslation) return maybeUniversalTranslation.ga;

    unseenTranslations.add(sentence);
    return sentence;
}

const config = { childList: true, subtree: true };
const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(translate);
    });
});

function startTranslation(){
    mutationObserver.observe(document.body, config);
    translate(document.body);
}

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
        console.error("Error with Gaeilgeoir extension: " + err);
    }
};

const website = window.location.hostname.split(".").slice(-2).join(".");
if (!ignoredWebsites.includes(website)) {
    xhttp.open("GET", "https://raw.githubusercontent.com/soceanainn/Gaeilgeoir/wip/translations/" + website + ".json", true);
    xhttp.send();
}

function exportTranslations(){
    const link = document.createElement('a');
    let exportData = 'data:text/csv;charset=utf-8,';

    exportData += 'Béarla,Gaeilge\n';
    siteTranslations.forEach(t => exportData += '"' + t.en +'","' + t.ga + '"\n');
    Array.from(unseenTranslations).sort((a,b) => a.length - b.length).forEach(t => exportData += '"' + t +'"\n');

    link.download = website + ".csv";
    link.href = encodeURI(exportData);
    link.click();
}
