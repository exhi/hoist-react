import {capitalize} from 'lodash';

/**
 * Basic util for splitting a string (via ' ') and capitalizing each word - e.g. for names.
 * Not intended to handle more advanced usages such as HTML or other word boundary characters.
 * @param {string} [str]
 */
export function capitalizeWords(str) {
    if (str == null || !str.length) return str;
    return str.split(' ')
        .map(s => capitalize(s))
        .join(' ');
}

/**
 * Wrap values in a custom span
 *
 * @param {*} [v] - value to be place in span, will be coerced into a string
 * @param {Object} [opts] - an options object:
 * @param {string} [opts.cls] - span's class property will be set to this
 * @param {string} [opts.title] - span's title property will be set to this
 * @param {boolean} [opts.leadSpc] - set to true to add a space before the v to be wrapped
 * @param {boolean} [opts.trailSpc] - set to true to add a space after the span to be returned
 *
 */
export function fmtSpan(v, {
    cls = null,
    title = null,
    leadSpc = false,
    trailSpc = false
} = {}) {

    if (v == null) return '';

    const txt = (leadSpc ? ' ' : '') + v;

    let ret = '<span';
    ret += cls ? ` class="${cls}"` : '';
    ret += title ? ` title="${title}"` : '';
    ret += `>${txt}</span>`;

    return trailSpc ? ret + ' ' : ret;
}