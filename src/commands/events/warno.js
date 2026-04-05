"use strict";

const { EmbedBuilder, SlashCommandBuilder, Colors, MessageFlags } = require('discord.js');
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warno')
    .setDescription('Creates a new Warning Order.')
    .addStringOption(opt =>
        opt.setName('type')
        .setDescription('The type of Operation to be potentially hosted.')
        .setRequired(true)
        .setChoices([
            {name: 'Area Security Operation', value: 'AREA_SECURITY'},
            {name: 'Counterinsurgency Operation', value: 'COUNTERINSURGENCY'},
            {name: 'Peacekeeping Operation', value: 'PEACEKEEPING'},
            {name: 'Expeditionary Operation', value: 'EXPEDITIONARY'},
        ])
    )
    .addStringOption(opt =>
        opt.setName('time1')
        .setDescription('A time which members can vote on.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('time2')
        .setDescription('A time which members can vote on.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('time3')
        .setDescription('A time which members can vote on.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('time4')
        .setDescription('A time which members can vote on.')
        .setRequired(false)
    )
    .addStringOption(opt =>
        opt.setName('time5')
        .setDescription('A time which members can vote on.')
        .setRequired(false)
    )
    .addStringOption(opt =>
        opt.setName('time6')
        .setDescription('A time which members can vote on.')
        .setRequired(false)
    )
    .addStringOption(opt =>
        opt.setName('time7')
        .setDescription('A time which members can vote on.')
        .setRequired(false)
    )
    .addStringOption(opt =>
        opt.setName('time8')
        .setDescription('A time which members can vote on.')
        .setRequired(false)
    )
    .addStringOption(opt =>
        opt.setName('time9')
        .setDescription('A time which members can vote on.')
        .setRequired(false)
    ),

    run: async ({ interaction }) => {
        try {
            await interaction.reply({content: "This command is currently under development.", flags: MessageFlags.Ephemeral})
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while posting the Warning Order: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            return;
        }
    },

    // testing command only
    deleted: process.env.THIS_ENVIRONMENT === "PRODUCTION",
}