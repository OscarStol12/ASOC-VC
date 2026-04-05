"use strict";

// baseline
const { fetchApi, isAnyErrorResponse } = require('rozod');

// endpoints
const { getUsersAuthenticated } = require('rozod/lib/endpoints/usersv1');
const { getUsersAvatar } = require('rozod/lib/endpoints/thumbnailsv1');

// wrappers
async function getAuthenticatedUser() {
    const response = await fetchApi(getUsersAuthenticated, undefined);

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get authenticated user: ${JSON.stringify(response)}`);

    return response.name;
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

async function ownsGamepass(userId, gamepassId) {
    console.log(userId, gamepassId);
    console.log(`/v1/gamepasses/${gamepassId}/users/${userId}/has-purchased`);
    const response = await fetchApi(`/v1/gamepasses/${gamepassId}/users/${userId}/has-purchased`, undefined);

    console.log(response);
    if (isAnyErrorResponse(response)) throw new Error(`Failed to get gamepass ownership info: ${JSON.stringify(response)}`);

    return response;
}

module.exports = { getAuthenticatedUser, getPlayerThumbnail, ownsGamepass };