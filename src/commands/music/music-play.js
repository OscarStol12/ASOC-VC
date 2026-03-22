"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const ytSearch = require('yt-search');
const { yt_validate } = require('play-dl');

const { convertToPrettyTime } = require(`${PROJECT_ROOT}/utils/dateConv.js`);
const { getLocalMetadata, getYouTubeMetadata, getPlaylistVideos } = require(`${PROJECT_ROOT}/utils/audioMetadata.js`);
const { addSongToQueue } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);
const { escapeDiscordMarkdown } = require(`${PROJECT_ROOT}/utils/discordUtils.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays an audio from a provided URL / Search query.')
    .addSubcommand(cmd =>
        cmd.setName('from-local')
        .setDescription(`Plays an audio from a provided local folder.`)
        .addAttachmentOption(opt =>
            opt.setName(`file`)
            .setDescription(`A local file to play in music.`)
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
        cmd.setName(`from-youtube`)
        .setDescription(`Plays a video from a provided youtube URL / search query.`)
        .addStringOption(opt =>
            opt.setName(`video`)
            .setDescription(`A URL or search query from YouTube.`)
            .setRequired(true)
        )
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction}) => {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        try {
            let voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Error`)
                .setDescription(`You are not in a voice channel! Please join one before running this command.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            // audio metadata
            let metadata;

            switch (subcommand) {
                case `from-local`: {
                    let file = interaction.options.getAttachment(`file`, true);
                    let url = file.url;

                    const SUPPORTED_CODECS = ['.m4a', '.mp3', '.mp4', '.mkv'];
                    let codecString = '';
                    let canPlay = false;

                    for (const codec of SUPPORTED_CODECS) {
                        codecString += `**${codec}**, `;
                        if (file.name.endsWith(codec)) canPlay = true;
                    }

                    codecString = codecString.substring(0, codecString.length - 2);

                    if (!canPlay) {
                        let embed = new EmbedBuilder()
                        .setTitle(`❌ Unsupported File Format`)
                        .setDescription(`The file you input is not a supported file format. Please try again using one of the supported file formats:\n\n${codecString}`)
                        .setColor(Colors.Red)
                        .setTimestamp();

                        await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                        return;
                    }

                    let transMetadata = await getLocalMetadata(url);

                    metadata = {
                        source: 'local',
                        title: transMetadata.title,
                        artist: transMetadata.artist,
                        duration: transMetadata.duration,
                        url: url,
                    };

                    try {
                        await addSongToQueue(interaction, metadata);
                    } catch (e) {
                        let embed = new EmbedBuilder()
                        .setTitle(`❌ Error`)
                        .setDescription(e.message)
                        .setColor(Colors.Red)
                        .setTimestamp();

                        await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                        return;
                    }

                    let embed = new EmbedBuilder()
                    .setTitle(`✅ Added to Queue`)
                    .setDescription(`The following song was successfully added to the queue:\n\n**Title:** ${escapeDiscordMarkdown(metadata.title)}\n**Artist:** ${escapeDiscordMarkdown(metadata.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(metadata.duration) * 1000))}`)
                    .setColor(Colors.Green)
                    .setTimestamp();
                    await interaction.editReply({embeds: [embed]});

                    break;
                }

                case `from-youtube`: {
                    let input = interaction.options.getString(`video`, true);
                    let validation = yt_validate(input);

                    if (input.startsWith('https') && validation === "video") {
                        let transMetadata = await getYouTubeMetadata(input);

                        let metadata = {
                            source: 'youtube',
                            title: transMetadata.title,
                            artist: transMetadata.artist,
                            duration: transMetadata.duration,
                            url: input,
                        };

                        try {
                            await addSongToQueue(interaction, metadata);
                        } catch (e) {
                            let embed = new EmbedBuilder()
                            .setTitle(`❌ Error`)
                            .setDescription(e.message)
                            .setColor(Colors.Red)
                            .setTimestamp();

                            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                            return;
                        }

                        let embed = new EmbedBuilder()
                        .setTitle(`✅ Added to Queue`)
                        .setDescription(`The following song was successfully added to the queue:\n\n**Title:** ${escapeDiscordMarkdown(metadata.title)}\n**Artist:** ${escapeDiscordMarkdown(metadata.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(metadata.duration) * 1000))}`)
                        .setColor(Colors.Green)
                        .setTimestamp();

                        await interaction.editReply({embeds: [embed]});
                    } else if (validation === "search") {
                        let search = await ytSearch(input);

                        if (!search.videos || search.videos.length === 0) {
                            let embed = new EmbedBuilder()
                            .setTitle(`❌ No Search Results`)
                            .setDescription(`No search results were found for the query: "${input}". Please try again with a different search query, or provide a direct URL.`)
                            .setColor(Colors.Red)
                            .setTimestamp();

                            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                            return;
                        }

                        let firstVideo = search.videos[0];

                        let metadata = {
                            source: 'youtube',
                            title: firstVideo.title,
                            artist: firstVideo.author.name,
                            duration: firstVideo.seconds,
                            url: firstVideo.url,
                        };

                        try {
                            await addSongToQueue(interaction, metadata);
                        } catch (e) {
                            let embed = new EmbedBuilder()
                            .setTitle(`❌ Error`)
                            .setDescription(e.message)
                            .setColor(Colors.Red)
                            .setTimestamp();

                            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                            return;
                        }

                        let embed = new EmbedBuilder()
                        .setTitle(`✅ Added to Queue`)
                        .setDescription(`The following song was successfully added to the queue:\n\n**Title:** ${escapeDiscordMarkdown(metadata.title)}\n**Artist:** ${escapeDiscordMarkdown(metadata.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(metadata.duration) * 1000))}`)
                        .setColor(Colors.Green)
                        .setTimestamp();

                        await interaction.editReply({embeds: [embed]});
                    } else if (validation === "playlist") {
                        const videos = await getPlaylistVideos(input);

                        if (videos.length === 0) {
                            let embed = new EmbedBuilder()
                            .setTitle(`❌ Empty Playlist`)
                            .setDescription(`No videos were found in the playlist, or it does not exist.`)
                            .setColor(Colors.Red)
                            .setTimestamp();

                            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                            return;
                        }

                        for (const video of videos) {
                            let metadata = {
                                source: 'youtube',
                                title: video.title,
                                artist: video.uploader,
                                duration: video.duration,
                                url: video.url,
                            }

                            await addSongToQueue(interaction, metadata);
                        }

                        let embed = new EmbedBuilder()
                        .setTitle(`✅ Added to Queue`)
                        .setDescription(`A playlist of ${videos.length} videos was added to the queue successfully.`)
                        .setColor(Colors.Green)
                        .setTimestamp();

                        await interaction.editReply({embeds: [embed]});
                    } else {
                        let embed = new EmbedBuilder()
                        .setTitle(`❌ Invalid Input`)
                        .setDescription(`Your input is not a search query, video, or playlist. Please use a valid input.`)
                        .setColor(Colors.Red)
                        .setTimestamp();

                        await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                        return;
                    }

                    break;
                }

                default: {
                    let embed = new EmbedBuilder()
                    .setTitle(`❌ Error`)
                    .setDescription(`${subcommand} is not a valid subcommand. Please try using a different subcommand.`)
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }
            }
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while playing music: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
            return;
        }
    },
}