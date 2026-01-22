"use strict";

/**
 * @param {number} raw
 * @returns {string}
 */
function convertToPrettyTime(raw) {
    let days = Math.floor(raw / 86_400_000);
    let hours = Math.floor((raw - (days * 86_400_000)) / 3_600_000);
    let minutes = Math.floor((raw - (days * 86_400_000 + hours * 3_600_000)) / 60_000);
    let seconds = Math.floor((raw - (days * 86_400_000 + hours * 3_600_000 + minutes * 60_000)) / 1_000);
    let millis = Math.floor(raw - (days * 86_400_000 + hours * 3_600_000 + minutes * 60_000 + seconds * 1_000));

    let finalString = ``;
    if (days > 0) finalString += `${days}d `;
    if (hours > 0) finalString += `${hours}h `;
    if (minutes > 0) finalString += `${minutes}m `;
    if (seconds > 0) finalString += `${seconds}s `;
    if (millis > 0) finalString += `${millis}ms `;
    return finalString.substring(0, finalString.length - 1);
}

/**
 * @param {string} pretty
 * @returns {number}
 */
function convertToRawMillis(pretty) {
    let raw = 0;
    let splits = pretty.split(" ");
    for (let split in splits) {
        if (split.includes('d')) {
            let index = split.indexOf('d');
            let timeSub = split.substring(0, index);
            raw += parseInt(timeSub) * 86_400_000;
        } else if (split.includes('h')) {
            let index = split.indexOf('h');
            let timeSub = split.substring(0, index);
            raw += parseInt(timeSub) * 3_600_000;
        } else if (split.includes('ms')) {
            let index = split.indexOf('ms');
            let timeSub = split.substring(0, index);
            raw += parseInt(timeSub);
        } else if (split.includes('m')) {
            let index = split.indexOf('m');
            let timeSub = split.substring(0, index);
            raw += parseInt(timeSub) * 60_000;
        } else if (split.includes('s')) {
            let index = split.indexOf('s');
            let timeSub = split.substring(0, index);
            raw += parseInt(timeSub) * 1_000;
        }
    }

    return raw;
}

module.exports = {convertToPrettyTime, convertToRawMillis}