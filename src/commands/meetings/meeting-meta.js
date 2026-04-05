"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { createMeetingRoom } = require(`${PROJECT_ROOT}/utils/meetingRoomHandler.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`meeting`)
    .setDescription(`Meeting command group`)
    .addSubcommand(cmd =>
        cmd.setName(`create`)
        .setDescription(`Creates a new private meeting room.`)
    )
    .addSubcommand(cmd =>
        cmd.setName(`list`)
        .setDescription(`Lists currently active meeting rooms.`)
    )
    .addSubcommand(cmd =>
        cmd.setName(`delete`)
        .setDescription(`Deletes an existing meeting room.`)
        .addStringOption(opt =>
            opt.setName(`id`)
            .setDescription(`The ID of the meeting room to delete.`)
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
        cmd.setName(`invite`)
        .setDescription(`Invites a person to a meeting room.`)
        .addStringOption(opt =>
            opt.setName(`id`)
            .setDescription(`The ID of the meeting room to add the person to.`)
            .setRequired(true)
        )
        .addUserOption(opt =>
            opt.setName(`user`)
            .setDescription(`The person to add to the meeting room.`)
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
        cmd.setName(`kick`)
        .setDescription(`Forcibly removes someone from a meeting room and revokes their access.`)
        .addStringOption(opt =>
            opt.setName(`id`)
            .setDescription(`The ID of the meeting room to kick the person from.`)
            .setRequired(true)
        )
        .addUserOption(opt =>
            opt.setName(`user`)
            .setDescription(`The person to remove from the meeting room.`)
            .setRequired(true)
        )
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply();

        try {
            switch (subcommand) {
                case 'create': {
                    break;
                }

                case 'list': {
                    break;
                }

                case 'delete': {
                    break;
                }

                case 'invite': {
                    break;
                }

                case 'kick': {
                    break;
                }

                default: {
                    let embed = new EmbedBuilder()
                    .setTitle(`❌ Invalid Subcommand`)
                    .setDescription(`An invalid subcommand was entered: ${subcommand}. Please try again with a valid subcommand.`)
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }
            }
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An unexpected error occurred: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },

    // testing command only
    deleted: process.env.THIS_ENVIRONMENT === "PRODUCTION"
}