const { SlashCommandBuilder } = require('@discordjs/builders');
const { useMainPlayer, useQueue } = require('discord-player');
const { EmbedBuilder } = require('discord.js');
const { embedColors } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a track provided by search terms or URL.')
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('Search terms or URL.')
                .setRequired(true)
        ),
    run: async ({ interaction }) => {
        if (!interaction.member.voice.channel) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `**Error**\nYou need to be in a voice channel to use this command.`
                        )
                        .setColor(embedColors.colorError)
                ]
            });
        }

        const player = useMainPlayer();
        const queue = useQueue(interaction.guild.id);
        const query = interaction.options.getString('query');

        try {
            const { track } = await player.play(
                interaction.member.voice.channel,
                query,
                {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        leaveOnEmptyCooldown: 60000,
                        leaveOnEndCooldown: 60000,
                        leaveOnStopCooldown: 60000
                    }
                }
            );

            // TODO: Add a check to see if the queue is empty, and if so, add a message to the embed saying that the track is now playing.
            // TODO: YouTube thumbnail not shown? Different url than track.thumbnail?
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setDescription(
                            `**Added to queue**\n\`[${track.duration}]\` **[${track.title}](${track.url})**`
                        )
                        .setThumbnail(track.thumbnail)
                        .setColor(embedColors.colorSuccess)
                ]
            });
        } catch (e) {
            console.log(`Error occured while trying to play track:\n\n${e}`);
            throw e;
        }
    }
};
