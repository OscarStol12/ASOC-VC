"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { getLoopMode, setLoopMode } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);
const isMusicController = require(`${PROJECT_ROOT}/src/validations/isMusicController.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`loop`)
    .setDescription(`Sets the loop mode. If no parameters are provided, displays the current loop mode.`)
    .addStringOption(opt =>
        opt.setName(`option`)
        .setDescription(`The type of loop to set.`)
        .setRequired(false)
        .setChoices([
            {name: 'Off', value: 'Off'},
            {name: 'Queue', value: 'Queue'},
            {name: 'Track', value: 'Track'},
        ])
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            const option = interaction.options.getString('option');
            if (option) {
                if (!(await isMusicController(interaction))) return;

                setLoopMode(option.toLowerCase());

                let embed = new EmbedBuilder()
                .setTitle(`✅ Loop State Changed`)
                .setDescription(`Successfully set the new loop state to: ${option}.`)
                .setColor(Colors.Green)
                .setTimestamp();

                await interaction.reply({embeds: [embed]});
            } else {
                let loopState = getLoopMode();
                let msg = "";

                switch (loopState) {
                    case 'off': {
                        msg = "The bot is not looping through any of the songs. (Off)"
                        break;
                    }

                    case 'queue': {
                        msg = "The bot is looping through the entire queue. (Queue)"
                        break;
                    }

                    case 'track': {
                        msg = "The bot is looping one song over and over. (Track)"
                        break;
                    }

                    default: {
                        throw new Error(`Illegal loop state: ${loopState}`)
                    }
                }

                let embed = new EmbedBuilder()
                .setTitle(`🔄 Current Loop State`)
                .setDescription(msg)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await interaction.reply({embeds: [embed]});
            }
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(e.message)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}