"use strict";

function escapeDiscordMarkdown(text) {
    if (!text) return '';
    
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\*/g, '\\*')
        .replace(/_/g, '\\_')
        .replace(/~/g, '\\~')
        .replace(/\|/g, '\\|')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#');
}

module.exports = { escapeDiscordMarkdown };