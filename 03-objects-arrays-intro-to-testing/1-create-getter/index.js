/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    let pathItems = path.split(".");
    
    return function(obj) {
        for (let item of pathItems) {
            if (!obj[item]) return;
            obj = obj[item];
        }
        return obj;
    }
}
