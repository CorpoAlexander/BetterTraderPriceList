function readFile(input) {
    let file = input.files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = function () {
        const formatted = formatConfig(fileReader.result);
        const itemTypes = getItemTypes(formatted);
        const data = getItems(formatted, itemTypes);
        const columns = {
            name:'Name',
            type:'Type',
            buyable:'Buyable',
            buyCost:'Cost',
            sellable:'Sellable',
            sellPrice:'Price'
        }
        const table = $('#table-sortable').tableSortable({
            data: data,
            columns: columns,
            pagination: true,
            rowsPerPage: data.length,
            searchField
        });
    };
    fileReader.onerror = function() {
        console.log(fileReader.error);
    };
}
// formatConfig removes comments and blank lines, leaving us with an array of useful config data
function formatConfig(rawText) {
    let lines = rawText.split('\n');
    return lines.filter(line => {
        return line.indexOf('#') !== 0 && line.length > 1;
    });
}
// getItemTypes iterates over formatted config array and returns an object with itemTypes and their global enable/disable status
function getItemTypes(formatted) {
    let itemTypes = {};
    for (const line in formatted) {
        if(formatted[line].includes('[B_General.ItemTypes')) {
            const itemType = formatted[line].substring(21, formatted[line].length-2);
            itemTypes[itemType] = formatted[parseInt(line) + 1].includes('true');
        }
        // Once we are past the itemTypes definitions we can break the for...in loop
        if(formatted[line].includes('[C_Items')) { break; }
    }
    return itemTypes;
}
// getItems iterates over formatted config array and returns an object with Items and all requisite data for display
function getItems(formatted, itemTypes) {
    let items = [];
    for (const line in formatted) {
        if(formatted[line].includes('[C_Items')){
            const type = formatted[line].substring(formatted[line].indexOf('.')+1,formatted[line].lastIndexOf('.'));
            const name = (formatted[line].substring(formatted[line].lastIndexOf('.')+1, formatted[line].length-2)).replace(/([a-z])([A-Z])/g, '$1 $2');
            const buyCost = parseInt(formatted[parseInt(line)+1].substring(formatted[parseInt(line)+1].lastIndexOf(' ')+1, formatted[parseInt(line)+1].length-1));
            const sellPrice = parseInt(formatted[parseInt(line)+2].substring(formatted[parseInt(line)+2].lastIndexOf(' ')+1, formatted[parseInt(line)+2].length-1));
            const buyable = formatted[parseInt(line)+4].includes('true') && itemTypes[type] ? '\u2714\uFE0F' : '\u274C';
            const sellable = formatted[parseInt(line)+5].includes('true') && itemTypes[type] ? '\u2714\uFE0F' : '\u274C';
            if(buyable === '\u2714\uFE0F' || sellable === '\u2714\uFE0F') { items.push({name, type, buyable, buyCost, sellable, sellPrice}); }
        }
    }
    return items;
}