function flatten(arr, item){
    arr = arr || [];
    if( Array.isArray(item)){
        return arr.concat(item.reduce(flatten,[]));
    } else {
        arr.push(item);
    }
    return arr;
}

function filterEmpty(item){
    return item;
}

module.exports = {
    flatten : flatten,
    filterEmpty : filterEmpty
};