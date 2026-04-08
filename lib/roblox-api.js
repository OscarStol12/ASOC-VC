"use strict";

// baseline
const { fetchApi, isAnyErrorResponse } = require('rozod');

// endpoints
const { getUsersAuthenticated, getUsersUserid, postUsernamesUsers } = require('rozod/lib/endpoints/usersv1');
const { getUsersAvatar } = require('rozod/lib/endpoints/thumbnailsv1');
const { getUsersUseridItemsItemtypeItemtargetidIsOwned } = require(`rozod/lib/endpoints/inventoryv1`);
const { getGroupsGroupid, patchGroupsGroupidUsersUserid, getGroupsGroupidRoles } = require('rozod/lib/endpoints/groupsv1');
const { getUsersUseridGroupsRoles } = require(`rozod/lib/endpoints/groupsv2`);

// wrappers
async function getAuthenticatedUser() {
    const response = await fetchApi(getUsersAuthenticated, undefined);

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get authenticated user: ${JSON.stringify(response)}`);

    return response;
}

async function getUserInfo(userId) {
    if (typeof(userId) !== 'number') {
        if (typeof(userId) !== 'string' || isNaN(userId)) {
            const type = typeof(userId);
            throw new Error(`userId: expected number, got ${type}`);
        } else userId = parseInt(userId, 10);
    }

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

    for (const username of usernames) {
        if (typeof(username) !== 'string') {
            const type = typeof(username);
            throw new Error(`usernames: one or more items in Array<string> is of type ${type}`)
        }
    }

    const response = await fetchApi(postUsernamesUsers, {
        body: {
            usernames: usernames,
            excludeBannedUsers: false,
        },
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get user ids: ${JSON.stringify(response)}`);

    const data = response.data;
    const results = data.map((result) => result !== undefined ? result.id : null);

    return (results.length > 1) ? results : results[0];
}

async function getPlayerThumbnail(userIds, size, format, isCircular) {
    if (Array.isArray(userIds)) {
        for (let i = 0; i < userIds.length; i++) {
            let userId = userIds[i];
            if (typeof(userId) !== 'number') {
                if (typeof(userId) !== 'string' || isNaN(userId)) {
                    const type = typeof(userId);
                    throw new Error(`userIds: one or more items in Array<number> is of type ${type}`);
                } else userIds[i] = parseInt(userId, 10);
            }
        }
    } else if (typeof(userIds) !== 'number') {
        if (typeof(userIds) !== 'string' || isNaN(userIds)) {
            const type = typeof(userIds);
            throw new Error(`userId: expected number, got ${type}`);
        } else userIds = parseInt(userIds, 10);
    }

    if (typeof(size) === 'string') {
        if (!(["30x30", "48x48", "60x60", "75x75", "100x100", "110x110", "140x140", "150x150", "150x200", "180x180", "250x250", "352x352", "420x420", "720x720"].find((i) => i === size))) {
            throw new Error(`size: ${size} is not a valid option`);
        }
    } else if (size !== undefined) {
        const type = typeof(size);
        throw new Error(`size: expected string, got ${type}`);
    }

    if (typeof(format) === 'string') {
        if (!(["Png", "Jpeg", "Webp"].find((i) => i === format))) {
            throw new Error(`format: ${format} is not a valid option`);
        }
    } else if (format !== undefined) {
        const type = typeof(format);
        throw new Error(`format: expected string, got ${type}`);
    }

    if (typeof(isCircular) !== 'boolean' && isCircular !== undefined) {
        const type = typeof(isCircular);
        throw new Error(`isCircular: expected boolean, got ${type}`);
    }

    const response = await fetchApi(getUsersAvatar, {
        userIds: userIds,
        size: size,
        format: format,
        isCircular: isCircular,
    })

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get player thumbnail: ${JSON.stringify(response)}`);

    return response.data;
}

async function getOwnership(userId, itemTargetId, itemType) {
    if (typeof(userId) !== 'number') {
        if (typeof(userId) !== 'string' || isNaN(userId)) {
            const type = typeof(userId);
            throw new Error(`userId: expected number, got ${type}`);
        } else userId = parseInt(userId, 10);
    }

    if (typeof(itemTargetId) !== 'number') {
        if (typeof(itemTargetId) !== 'string' || isNaN(itemTargetId)) {
            const type = typeof(itemTargetId);
            throw new Error(`itemTargetId: expected number, got ${type}`);
        } else itemTargetId = parseInt(itemTargetId, 10);
    }

    if (typeof(itemType) === 'number') {
        if (!([0, 1, 2, 3, 4].find((i) => i === itemType))) {
            throw new Error(`itemType: ${itemType} is not a valid option`);
        }
    } else if (typeof(itemType) === 'string') {
        if (!(["Asset", "GamePass", "Badge", "Bundle"].find((i) => i === itemType))) {
            throw new Error(`itemType: ${itemType} is not a valid option`);
        }
    } else {
        const type = typeof(itemType);
        throw new Error(`itemType: expected number or string, got ${type}`)
    }

    const response = await fetchApi(getUsersUseridItemsItemtypeItemtargetidIsOwned, {
        userId: userId,
        itemType: itemType,
        itemTargetId: itemTargetId,
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get item ownership: ${JSON.stringify(response)}`);

    return response;
}

async function getGroup(groupId) {
    if (typeof(groupId) !== 'number') {
        if (typeof(groupId) !== 'string' || isNaN(groupId)) {
            const type = typeof(groupId);
            throw new Error(`groupId: expected number, got ${type}`);
        } else groupId = parseInt(groupId, 10);
    }

    const response = await fetchApi(getGroupsGroupid, {
        groupId: groupId,
        requestOptions: {retries: 5, retryDelay: 5000},
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get group info: ${JSON.stringify(response)}`);

    return response;
}

async function getGroups(userId) {
    if (typeof(userId) !== 'number') {
        if (typeof(userId) !== 'string' || isNaN(userId)) {
            const type = typeof(userId);
            throw new Error(`userId: expected number, got ${type}`);
        } else userId = parseInt(userId, 10);
    }

    const response = await fetchApi(getUsersUseridGroupsRoles, {
        userId: userId,
        includeLocked: false,
        includeNotificationPreferences: false,
        discoveryType: 0,
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get user groups: ${JSON.stringify(response)}`);

    return response.data;
}

async function getInfoInGroup(userId, groupId) {
    if (typeof(groupId) !== 'number') {
        if (typeof(groupId) !== 'string' || isNaN(groupId)) {
            const type = typeof(groupId);
            throw new Error(`groupId: expected number, got ${type}`);
        } else groupId = parseInt(groupId, 10);
    }

    const groups = await getGroups(userId);

    const group = groups.find((info) => groupId === info.group.id);
    return group ?? null;
}

async function getRankInGroup(groupId, userId) {
    const info = await getInfoInGroup(userId, groupId);
    return (info) ? info.role.rank : 0;
}

async function getRankNameInGroup(groupId, userId) {
    const info = await getInfoInGroup(userId, groupId);
    return (info) ? info.role.name : "Guest";
}

async function getRoles(groupId) {
    if (typeof(groupId) !== 'number') {
        if (typeof(groupid) !== 'string' || isNaN(groupId)) {
            const type = typeof(groupId);
            throw new Error(`groupId: expected number, got ${type}`);
        } else groupId = parseInt(groupId, 10);
    }

    const response = await fetchApi(getGroupsGroupidRoles, {
        groupId: groupId,
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to get group roles: ${JSON.stringify(response)}`);

    let roles = response.roles;
    return roles.sort((a, b) => a.rank - b.rank);
}

async function getRole(groupId, roleQuery) {
    let searchType = "";

    if (typeof(roleQuery) === 'number') {
        if (roleQuery <= 255) searchType = "Rank";
        else searchType = "Role";
    } else if (typeof(roleQuery) === 'string') {
        searchType = "Name";
    } else {
        const type = typeof(roleQuery);
        throw new Error(`roleQuery: expected number or string, got ${type}`);
    }

    const roles = await getRoles(groupId);
    let find;

    switch (searchType) {
        case 'Rank': {
            find = roles.find((role) => role.rank === roleQuery);
            break;
        }

        case 'Role': {
            find = roles.find((role) => role.id === roleQuery);
            break;
        }

        case 'Name': {
            find = roles.find((role) => role.name === roleQuery);
            break;
        }

        default: {
            throw new Error(`Unexpected error: search mode ${searchType} not defined`);
        }
    }

    if (!find) throw new Error(`Unable to find role with query ${searchType} ${roleQuery}`);
    return find;
}

async function setRank(groupId, userId, role) {
    if (typeof(userId) !== 'number') {
        if (typeof(userId) !== 'string' || isNaN(userId)) {
            const type = typeof(userId);
            throw new Error(`userId: expected number, got ${type}`);
        } else userId = parseInt(userId, 10);
    }

    const roleQuery = (typeof(role) === 'object') ? role : await getRole(groupId, role);
    
    const response = await fetchApi(patchGroupsGroupidUsersUserid, {
        groupId: groupId,
        userId: userId,
        body: {
            roleId: roleQuery.id,
        },
    }, {
        headers: {
            Cookie: `.ROBLOSECURITY=${process.env.ROBLOSECURITY}`
        }
    });

    if (isAnyErrorResponse(response)) throw new Error(`Failed to set user rank: ${JSON.stringify(response)}`);
    return true;
}

async function changeRank(groupId, userId, delta) {
    if (typeof(delta) !== 'number') {
        if (typeof(delta) !== 'string' || isNaN(delta)) {
            const type = typeof(delta);
            throw new Error(`delta: expected number, got ${type}`);
        } else delta = parseInt(delta, 10);
    }

    const currentUserRank = await getInfoInGroup(userId, groupId);
    if (!currentUserRank) throw new Error(`Specified user is not in group`);

    const roleSet = await getRoles(groupId);
    const indexRef = roleSet.findIndex((role) => currentUserRank.role.id === role.id);

    if (indexRef + delta < 0 || indexRef + delta >= roleSet.length) throw new Error(`Rank change out of range`);

    const newRole = roleSet[indexRef + delta];
    return (await setRank(groupId, userId, newRole));
}

async function promote(groupId, userId) {
    return (await changeRank(groupId, userId, 1));
}

async function demote(groupId, userId) {
    return (await changeRank(groupId, userId, -1));
}

module.exports = { 
    getAuthenticatedUser,
    getPlayerThumbnail,
    getOwnership,
    getUserInfo,
    getUsernameFromId,
    getIdFromUsername,
    getGroup,
    getGroups,
    getInfoInGroup,
    getRankInGroup,
    getRankNameInGroup,
    getRoles,
    getRole,
    setRank,
    changeRank,
    promote,
    demote,
};