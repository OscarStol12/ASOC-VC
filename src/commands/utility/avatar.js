'use strict';

const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription(`Gets a user's profile picture.`)
    .addUserOption((opt) => 
        opt.setName('user')
        .setDescription(`The user to get the avatar of.`)
        .setRequired(true)
    ),

    run: async ({ interaction }) => {
        let target = interaction.options.get('user')?.value;

        try {
            // Check to see if the target member is in the server
            if (interaction.guild.members.cache.get(target) === undefined) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Error`)
                .setDescription(`<@${target}> is not in this server.`)
                .setColor(Colors.Red)
                .setTimestamp();
                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            target = await interaction.guild.members.fetch(target);
            let embed = new EmbedBuilder()
            .setTitle(`📸 User Avatar`)
            .setImage(target.displayAvatarURL({ size: 1024 }))
            .setColor(Colors.Yellow)
            .setTimestamp();
            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`Failed to get user avatar: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();
            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}