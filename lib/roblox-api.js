"use strict";

// baseline
const { fetchApi, isAnyErrorResponse } = require('rozod');

// endpoints
const { getUsersAuthenticated, getUsersUserid, postUsernamesUsers } = require('rozod/lib/endpoints/usersv1');
const { getUsersAvatar } = require('rozod/lib/endpoints/thumbnailsv1');
const { getUsersUseridItemsItemtypeItemtargetidIsOwned } = require(`rozod/lib/endpoints/inventoryv1`);

// wrappers
async function getAuthenticatedUser() {
    const response = await fetchApi(getUsersAuthenticated, undefined);

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get authenticated user: ${JSON.stringify(response)}`);

    return response;
}

async function getUserInfo(userId) {
    const response = await fetchApi(getUsersUserid, {
        userId: userId,
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get user info: ${JSON.stringify(response)}`);

    return response;
}

async function getUsernameFromId(userId) {
    return (await getUserInfo(userId)).name;
}

async function getIdFromUsername(usernames) {
    usernames = Array.isArray(usernames) ? usernames : [usernames];
    const response = await fetchApi(postUsernamesUsers, {
        body: {
            usernames: usernames,
            excludeBannedUsers: false,
        },
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get user id: ${JSON.stringify(response)}`);

    const data = response.data;
    const results = data.map((result) => result !== undefined ? result.id : null);

    return (results.length > 1) ? results : results[0];
}

async function getPlayerThumbnail(userIds, size, format, isCircular, type) {
    const response = await fetchApi(getUsersAvatar, {
        userIds: userIds,
        size: size,
        format: format,
        isCircular: isCircular,
        type: type,
    })

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get player thumbnail: ${JSON.stringify(response)}`);

    return response.data;
}

async function getOwnership(userId, itemTargetId, itemType) {
    const response = await fetchApi(getUsersUseridItemsItemtypeItemtargetidIsOwned, {
        userId: userId,
        itemType: itemType,
        itemTargetId: itemTargetId,
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get item ownership: ${JSON.stringify(response)}`);

    return response;
}

module.exports = { getAuthenticatedUser, getPlayerThumbnail, getOwnership, getUserInfo, getUsernameFromId, getIdFromUsername };