"use strict";

const { EmbedBuilder, Colors, ChatInputCommandInteraction } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { spawn } = require('child_process');

const { convertToPrettyTime } = require(`${PROJECT_ROOT}/utils/dateConv.js`);
const { escapeDiscordMarkdown } = require(`${PROJECT_ROOT}/utils/discordUtils.js`);

const player = createAudioPlayer();
let MUSIC_QUEUE = [];
let paused = false;
let inBetweenSongs = false;
let connection, currentChannel, currentSong;
let loopMode = "off";

/**
 * 
 * @param {ChatInputCommandInteraction} interaction
 * @param {Stream.Readable} stream 
 * @param {any} metadata 
*/
function addSongToQueue(interaction, metadata) {
    let voiceChannel = interaction.member.voice.channel;

    if (currentChannel && (currentChannel.id !== voiceChannel.id)) {
        throw new Error("You must be in the same voice channel as the bot to add songs to the queue!");
    }
    
    // Add song to end of queue
    MUSIC_QUEUE[MUSIC_QUEUE.length] = {
        metadata: {
            source: metadata.source,
            title: metadata.title,
            artist: metadata.artist,
            duration: metadata.duration,
            caller: interaction.member,
            url: metadata.url,
        },
    };

    // Join a voice channel if not currently in one
    if (!connection) {
        currentChannel = interaction.member.voice.channel;
        connection = joinVoiceChannel({
            channelId: currentChannel.id,
            guildId: currentChannel.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection.subscribe(player);
    }

    if (player.state.status === AudioPlayerStatus.Idle && !paused && !inBetweenSongs) {
        playAudio(MUSIC_QUEUE[0]);
    }
}

function getCurrentSong() {
    if (!currentSong) throw new Error("No song is playing at this time!");

    return {
        title: currentSong.metadata.title,
        artist: currentSong.metadata.artist,
        duration: currentSong.metadata.duration,
        caller: currentSong.metadata.caller,
        timeElapsed: Date.now() - currentSong.playbackStarted,
    };
}

function pauseSong(interaction) {
    let voiceChannel = interaction.member.voice.channel;

    if (currentChannel && (currentChannel.id !== voiceChannel.id)) {
        throw new Error("You must be in the same voice channel as the bot to pause playback!");
    }

    if (paused) throw new Error("Playback is already paused at this time.");
    if (player.state.status === AudioPlayerStatus.Idle) throw new Error("There is no song playing at this time.");

    paused = true;
    player.pause();
}

function resumeSong(interaction) {
    let voiceChannel = interaction.member.voice.channel;

    if (currentChannel && (currentChannel.id !== voiceChannel.id)) {
        throw new Error("You must be in the same voice channel as the bot to resume playback!");
    }

    if (!paused) throw new Error("Playback is not paused at this time.");
    if (player.state.status === AudioPlayerStatus.Idle) throw new Error("There are no songs paused at this time.");

    player.unpause();
    paused = false;
}

function skipSong(interaction) {
    let voiceChannel = interaction.member.voice.channel;

    if (currentChannel && (currentChannel.id !== voiceChannel.id)) {
        throw new Error("You must be in the same voice channel as the bot to skip songs!");
    }

    if (MUSIC_QUEUE.length === 0) throw new Error("There is no song playing at this time.");

    player.stop();
}

function clearQueue(interaction) {
    let oldLoop = loopMode;
    let voiceChannel = interaction.member.voice.channel;

    if (currentChannel && (currentChannel.id !== voiceChannel.id)) {
        throw new Error("You must be in the same voice channel as the bot to stop playback!");
    }

    if (MUSIC_QUEUE.length === 0) throw new Error("There are no songs in the queue at this time.");
    
    MUSIC_QUEUE = [];
    loopMode = "off";
    player.stop();

    loopMode = oldLoop;
}

function removeSongInQueue(interaction, pos) {
    let voiceChannel = interaction.member.voice.channel;

    if (currentChannel && (currentChannel.id !== voiceChannel.id)) {
        throw new Error("You must be in the same voice channel as the bot to remove songs from the queue!");
    }

    if (MUSIC_QUEUE.length === 0) throw new Error("There are no songs to remove from the queue!");
    if (pos >= MUSIC_QUEUE.length || pos < 1) throw new Error(`Invalid position entry for queue removal: ${pos}`);

    const removed = MUSIC_QUEUE.splice(pos, 1)[0];

    if (removed === currentSong) {
        currentSong = null;
        player.stop();
    }

    return removed;
}

function getQueue() {
    if (MUSIC_QUEUE.length === 0) throw new Error("The queue is currently empty!");

    let send = [];

    for (let entry of MUSIC_QUEUE) {
        send.push({
            title: entry.metadata.title,
            artist: entry.metadata.artist,
            duration: entry.metadata.duration, 
            caller: entry.metadata.caller,
        });
    }

    return send;
}

function playAudio(audio) {
    let process;
    let metadata = audio.metadata;
    
    switch (metadata.source) {
        case 'local': {
            process = spawn('ffmpeg', [
                '-i', metadata.url,
                '-analyzeduration', '0',
                '-loglevel', '0',
                '-vn',
                '-map', '0:a:0',
                '-c:a', 'libopus',
                '-b:a', '128k',
                '-f', 'opus',
                '-ar', '48000',
                '-ac', '2',
                '-frame_size', '960',
                'pipe:1',
            ], { stdio: ['ignore', 'pipe', 'pipe'] });
            break;
        }

        case 'youtube': {
            process = spawn('yt-dlp', [
                '--cookies', `${PROJECT_ROOT}/cookies/yt-cookies.txt`,
                '-f', 'bestaudio/best',
                '--extract-audio',
                '--audio-format', 'opus',
                '--audio-quality', '0',
                '--js-runtimes', 'node',
                '--no-playlist',
                '--sponsorblock-remove', 'default',
                '--remote-components', 'ejs:github',
                '--extractor-args', 'youtube:player_client=android',
                '-o', '-',
                metadata.url,
            ], { stdio: ['ignore', 'pipe', 'pipe'] });
            break;
        }

        default: {
            throw new Error(`Unsupported source: ${metadata.source}`);
        }
    }

    currentSong = audio;
    const resource = createAudioResource(process.stdout, {
        inputType: StreamType.Arbitrary,
    });

    player.play(resource);
}

function handleSongEnd() {
    if (player.state.status !== AudioPlayerStatus.Idle || paused || inBetweenSongs) return;

    inBetweenSongs = true;

    if (player.state.status !== AudioPlayerStatus.Idle) {
        inBetweenSongs = false;
        return;
    }

    try {
        switch (loopMode) {
            case 'off': {
                if (MUSIC_QUEUE.length > 0) MUSIC_QUEUE.shift();
                if (MUSIC_QUEUE.length > 0) playAudio(MUSIC_QUEUE[0]);
                else currentSong = null;
                break;
            }

            case 'queue': {
                let temp = MUSIC_QUEUE.shift();
                MUSIC_QUEUE.push(temp);
                playAudio(MUSIC_QUEUE[0]);
                break;
            }

            case 'track': {
                if (currentSong) playAudio(currentSong);
                else currentSong = null;
                break;
            }

            default: {
                throw new Error(`Illegal loop state: ${loopMode}`);
            }
        }
    } catch (e) {
        console.error(e.message);
    } finally {
        inBetweenSongs = false;
    }
}

player.on('stateChange', async (oldState, newState) => {
    if (newState.status === AudioPlayerStatus.Idle) handleSongEnd();

    if (newState.status === AudioPlayerStatus.Playing && oldState.status !== AudioPlayerStatus.AutoPaused && !paused) {
        currentSong.playbackStarted = Date.now();

        let metadata = currentSong.metadata;
        let nowPlayingEmbed = new EmbedBuilder()
        .setTitle(`🎵 Now Playing`)
        .setDescription(`The bot is now playing the following song: \n\n**Title:** ${escapeDiscordMarkdown(metadata.title)}\n**Artist:** ${escapeDiscordMarkdown(metadata.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(metadata.duration) * 1000))}\n**Added by:** <@${metadata.caller.id}>`)
        .setColor(Colors.DarkBlue)
        .setTimestamp();

        await currentChannel.send({embeds: [nowPlayingEmbed]});
    }
});

function getLoopMode() {
    return loopMode;
}

function setLoopMode(mode) {
    const VALID_OPTIONS = ["off", "queue", "track"];
    if (!VALID_OPTIONS.includes(mode)) throw new Error(`Invalid loop mode setting: ${mode}`);
    loopMode = mode;
}

module.exports = {addSongToQueue, getCurrentSong, removeSongInQueue, getLoopMode, setLoopMode, getQueue, skipSong, clearQueue, pauseSong, resumeSong};