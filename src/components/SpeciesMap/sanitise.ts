// -------------------------------------------------------------------------
/** Sanitise a generic string as provided by a caller parameter.
 * 
 * @param {string} name - Name of parameter.
 * @param {string|undefined} param - Value of parameter.
 * @param {string} filter - Regex filter to be applied to string.
 * @param {string} preset - Return value if no match/undefined
 * @returns {string} - Sanitised string.
 */
export function sanitiseParam(name: string, param: string|undefined, filter: RegExp, preset: string = ''): string {
    
    let rv = '';
    if (param !== undefined) {
        rv = param.replace(filter, '');
        if (rv !== param) {
            console.warn(`Parameter '${name}' contains invalid characters. ` +
            `Using the value '${rv}' instead`);
        }
    }
    return (rv === '' ? preset : rv);
}
// -------------------------------------------------------------------------
/** Check whether a supplied parameter matches an entry in a given list of
* acceptable values.
* 
* @param {string} name - Name of parameter.
* @param {string|undefined} param - Value of parameter.
* @param {string[]} list - Array of acceptable values.
* @param {string} preset - Return value if no match/undefined
* @returns {string} - Matching value or preset if no match/undefined.
*/
export function sanitiseParamList(name: string, param: string|undefined, list: string[], preset: string = ''): string {

    let rv = '';
    if (param !== undefined) {
        const clean = sanitiseParam(name, param, /[^a-zA-Z0-9-]/g)
                        .toLowerCase();
        for (let i=0; i < list.length; i++) {
            if (clean === list[i]) {
                rv = list[i];
                break;
            }   
        }
        if (rv === '') {
            console.warn(`Parameter '${name}' has the unrecognised value ` +
                `of '${clean}'. Acceptable values are: ${list.join(', ')}`);
            }
    }
    return (rv === '' ? preset : rv);
} 
// -------------------------------------------------------------------------
/** Check whether a supplied parameter is a valid URL.
 * 
 * @param {string} name - Name of parameter.
 * @param {string} param - Value of parameter.
 * @returns {string} URL or empty string if undefined/invalid
 */
export function sanitiseUrl(name: string, param: string|undefined): string {
    
    let rv = '';
    if (param !== undefined) {
        rv = param;
        try {
            new URL(rv);
        }
        catch (err) {
            console.warn(`Parameter '${name}' is not a valid URL: ${rv}`);
            rv = '';
        }
    }
    return rv;
} 
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
