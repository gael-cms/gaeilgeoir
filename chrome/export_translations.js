function exportTranslations(){
    const link = document.createElement('a');
    let exportData = 'data:text/csv;charset=utf-8,';

    exportData += 'Béarla,Gaeilge,Comhthéacs\n';
    siteTranslations.forEach(t => exportData += '"' + t.en +'", "' + t.ga + (t.context ? '", "' + t.context : '') + '"\n');
    Array.from(unseenTranslations).sort((a,b) => a.length - b.length).forEach(t => exportData += '"' + t +'"\n');

    link.download = domain + ".csv";
    link.href = encodeURI(exportData);
    link.click();
}
