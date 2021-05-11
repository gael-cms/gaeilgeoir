function exportTranslations(){
    const link = document.createElement('a');
    let exportData = 'data:text/csv;charset=utf-8,';

    exportData += 'Béarla,Gaeilge,Comhthéacs\n';
    siteTranslations.forEach(t => exportData += '"' + t.en +'", "' + t.ga + (t.context ? '", "' + t.context : '') + '"\n');
    Array.from(unseenTranslations).sort((a,b) => a.length - b.length).forEach(t => exportData += '"' + t +'"\n');

    link.download = domain + ".csv";
    link.href = encodeURI(exportData).replace(/#/g, '%23');
    link.click();
}

function showDocs(){
    const link = document.createElement('a');
    link.href = "https://soceanainn.github.io/gaeilgeoir/";
    link.target = "_blank";
    link.click();
}

function support(){
    const link = document.createElement('a');
    link.href = "https://paypal.me/soceanainn";
    link.target = "_blank";
    link.click();
}

chrome.runtime.onMessage.addListener(function (message) {
    if (message.exportTranslations) return exportTranslations();
    if (message.showDocs) return showDocs();
    if (message.support) return support();
});