/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (size === undefined) return string;
    if (string.length === 0 || size === 0) return "";
    let returnStr = string[0];
    let cnt = 1;
    for (let i = 0; i < string.length; i++) {
        if (returnStr[returnStr.length - 1] != string[i]) {
            returnStr += string[i];
            cnt = 1;
        }
        else if (cnt < size) {
            returnStr += string[i];
            cnt++;
        }
    }
    return returnStr;
}
