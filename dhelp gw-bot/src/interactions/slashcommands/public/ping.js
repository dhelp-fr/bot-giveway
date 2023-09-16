import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {DhelpClient} from "../../../structure/Client.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Vous envoie la latence du bot."),
    /**
     *
     * @param {DhelpClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    execute(client, interaction) {
        void interaction.reply({
            embeds: [embeds.website(client, interaction)]
        });
    },
}

const embeds = {
    /**
     *
     * @param {DhelpClient} client
     * @param {ChatInputCommandInteraction} interaction
     * @returns {EmbedBuilder}
     */
    website: (client, interaction) => new EmbedBuilder()
    .setColor(client.color)
    .setTitle(":robot: Latence du bot")
    .setDescription(`\`${client.ws.ping}ms\` Latence API.\n\`${Date.now() - interaction.createdTimestamp}ms\` Latence de réponse.`)
}