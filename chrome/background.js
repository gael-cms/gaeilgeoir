function toSentences(text){
    return text.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|");
}

function filterNodes(node){
    return node.textContent.trim() !== "" && ['SCRIPT', 'STYLE'].indexOf(node.parentElement.tagName) === -1;
}

const universal_mappings = [
    // General - Ginearálta
    {"en": "Home", "ga": "Baile"},
    {"en": "About Me", "ga": "Eolas Fúm"},
    {"en": "Contact", "ga": "Teagmháil"},
];

function textNodesUnder(el){
    let walk = document.createTreeWalker(el,NodeFilter.SHOW_TEXT, null,false);
    while(walk.nextNode())
        if (filterNodes(walk.currentNode))
           processTextNode(walk.currentNode);
}

function processTextNode(abc){
    const sentences = toSentences(abc.nodeValue);
    const output = [];

    sentences.forEach(abc => output.push(maybeConvertSentence(abc)));
    abc.nodeValue = output.join(" ");
}

function maybeConvertSentence(sentence){
    const maybeTranslation = universal_mappings.find(t => t.en === sentence.trim());
    if (maybeTranslation) return maybeTranslation.ga;
    return sentence;
}

function translate(elem) {
    try {
        textNodesUnder(elem);
    } catch (err) {
        console.log(err);
    }
}

translate(document.body);

const config = { childList: true, subtree: true };
const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(translate);
    });
});

mutationObserver.observe(document.body, config);

const xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
        // Typical action to be performed when the document is ready:
        console.log(xhttp.responseText);
    }
};
xhttp.open("GET", "file:///Users/soceanainn/workspace/personal/gaeilgeoir/chrome/abcd.json", true);
xhttp.send();