import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder} from "discord.js";
import yaml from "js-yaml";
/**
 *
 * @param {DhelpClient} client
 * @param {ButtonInteraction} interaction
 */
export default async function (client, interaction) {
    const messageId = interaction.message.id;
    if (!client._fs.existsSync(`./giveaways/${messageId}.yml`)) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("Il y a eu un problème avec ce giveaway.")
        ],
        ephemeral: true
    });

    /**
     * @type {{
         winners: number,
         startedTimestamp: number,
         endTimestamp: number,
         messageId: string,
         prize: string,
         host: string,
         channelId: string,
         participants: string[]
     }}
     */
    const giveaway = yaml.load(client._fs.readFileSync(`./giveaways/${messageId}.yml`));

    if (giveaway.participants.includes(interaction.user.id)) {
        giveaway.participants.splice(giveaway.participants.findIndex(x => x === interaction.user.id), 1);
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setDescription(`Vous ne participez plus au giveaway pour **${giveaway.prize}**.`)
            ],
            ephemeral: true
        })
    } else {
        giveaway.participants.push(interaction.user.id);
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setDescription(`Vous participez au giveaway pour **${giveaway.prize}**.`)
            ],
            ephemeral: true
        })
    }
    const channel = await client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);
    message.edit({
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setEmoji("🎉")
                    .setLabel(giveaway.participants.length.toString())
                    .setCustomId("giveaway")
                    .setStyle(ButtonStyle.Primary)
            )
        ]
    })

    client._fs.writeFileSync(`./giveaways/${messageId}.yml`, yaml.dump(giveaway));
}