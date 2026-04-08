"use strict";

const { getUserInfo, getIdFromUsername, getUsernameFromId } = require(`${PROJECT_ROOT}/lib/roblox-api.js`)
const VerificationData = require(`${PROJECT_ROOT}/data/UserVerification`);

async function getRobloxUserFromNameOrId(info) {
    let user;
    if (!isNaN(info)) {
        // User ID provided
        user = await getUserInfo(parseInt(info));
    } else {
        // Username provided
        let id = await getIdFromUsername(info);
        user = await getUserInfo(id);
    }

    return user ?? null;
}

async function getRobloxUserFromDiscord(id) {
    let user;

    const query = {
        discordId: id,
    };

    let dataEntry = await VerificationData.findOne(query);

    if (await hasRobloxAccountLinked(id)) {
        user = await getUserInfo(parseInt(dataEntry.robloxId));
    } else {
        if (!dataEntry) dataEntry = new VerificationData({
            discordId: id,
            robloxId: "None",
            robloxName: "None",
            UTCOffset: 0,
        });

        let response = await fetch(`https://api.rowifi.xyz/v3/guilds/950210517673312289/members/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${process.env.ROWIFI_API_KEY}`
            }
        })

        if (response.status !== 200) throw new Error(`Rowifi API returned a status code of ${response.status}`);

        const data = await response.json();

        dataEntry.robloxId = data.roblox_id;
        dataEntry.robloxName = await getUsernameFromId(data.roblox_id);
        await dataEntry.save();

        user = await getUserInfo(data.roblox_id);
    }

    return user;
}

async function getDiscordIdFromRobloxNameOrId(info) {
    let query;

    if (!isNaN(info)) query = {
        robloxId: info
    }; else query = {
        robloxName: info
    };

    let dataEntry = await VerificationData.findOne(query);

    if (dataEntry) return dataEntry.discordId;
    else return null;
}

async function hasRobloxAccountLinked(id) {
    const query = {
        discordId: id,
    };

    let dataEntry = await VerificationData.findOne(query);

    if (dataEntry) {
        return (
            dataEntry.robloxId !== "None" &&
            dataEntry.robloxName !== "None"
        );
    } else {
        return false;
    }
}

module.exports = {getRobloxUserFromNameOrId, getRobloxUserFromDiscord, getDiscordIdFromRobloxNameOrId, hasRobloxAccountLinked};