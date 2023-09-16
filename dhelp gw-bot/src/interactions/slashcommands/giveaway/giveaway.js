import {
    PermissionsBitField,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle
} from "discord.js";
import {DhelpClient} from "../../../structure/Client.js";
import ms from "ms";
import * as yaml from "js-yaml";

export default {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Gestionnaire des giveaways")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(
            sub => sub
                .setName("créer")
                .setDescription("Créer un giveaway.")
                .addStringOption(
                    opt => opt
                        .setName("récompense")
                        .setDescription("La récompense du giveaway.")
                        .setRequired(true)
                        .setMaxLength(80)
                )
                .addStringOption(
                    opt => opt
                        .setName("durée")
                        .setDescription("La durée du giveaway.")
                        .setRequired(true)
                        .setMaxLength(15)
                )
                .addIntegerOption(
                    opt => opt
                        .setName("gagnants")
                        .setDescription("Le nombre de gagnants.")
                        .setRequired(true)
                        .setMinValue(1)
                )
        )
        .addSubcommand(
            sub => sub
                .setName("supprimer")
                .setDescription("Créer un giveaway.")
                .addStringOption(
                    opt => opt
                        .setName("giveaway")
                        .setDescription("le giveaway que vous souhaitez supprimer.")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            sub => sub
                .setName("terminer")
                .setDescription("Créer un giveaway.")
                .addStringOption(
                    opt => opt
                        .setName("giveaway")
                        .setDescription("le giveaway que vous souhaitez créer.")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(
            sub => sub
                .setName("reroll")
                .setDescription("Créer un giveaway.")
                .addStringOption(
                    opt => opt
                        .setName("giveaway")
                        .setDescription("le giveaway que vous souhaitez reroll.")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        ),
    /**
     *
     * @param {DhelpClient} client
     * @param {AutocompleteInteraction} interaction
     */
    autocomplete: (client, interaction) => {
        const focused = interaction.options.getFocused();

        if (interaction.options.getSubcommand() === "reroll") {
            /**
             * @type {{
                 winners: number,
                 startedTimestamp: number,
                 endTimestamp: number,
                 messageId: string,
                 channelId: string,
                 prize: string,
                 host: string,
                 participants: string[]
             }[]}
             */
            const Data = client._fs.readdirSync("./giveaways/ended").map(x => yaml.load(client._fs.readFileSync(`./giveaways/ended/${x}`)));

            const choices = Data.map(x => ({name: `${x.messageId} - ${x.prize.slice(0, 50)}`, value: x.messageId}))
            interaction.respond(choices.filter(x => x.name.includes(focused)));
        } else {
            /**
             * @type {{
                 winners: number,
                 startedTimestamp: number,
                 endTimestamp: number,
                 messageId: string,
                 channelId: string,
                 prize: string,
                 host: string,
                 participants: string[]
             }[]}
             */
            const Data = client._fs.readdirSync("./giveaways").filter(x => x.endsWith(".yml")).map(x => yaml.load(client._fs.readFileSync(`./giveaways/${x}`)));

            const choices = Data.map(x => ({name: `${x.messageId} - ${x.prize.slice(0, 50)}`, value: x.messageId}))
            interaction.respond(choices.filter(x => x.name.includes(focused)));
        }
    },
    /**
     *
     * @param {DhelpClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    execute: async (client, interaction) => {
        switch (interaction.options.getSubcommand()) {
            case "créer" : {
                const prize = interaction.options.getString("récompense");
                const duration = interaction.options.getString("durée");
                const winners = interaction.options.getInteger("gagnants");

                try {
                    ms(prize);
                } catch (e) {
                    return interaction.reply({
                        embeds: [ embeds.UnknowTime() ],
                        ephemeral: true
                    });
                }


                const channel = await interaction.channel;

                channel.send({
                    embeds: [embeds.giveawayEmbed(prize, interaction.user.id, Math.round((Date.now() + ms(duration))/1000), winners) ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setEmoji("🎉")
                                .setLabel("0")
                                .setCustomId("giveaway")
                                .setStyle(ButtonStyle.Primary)
                        )
                    ]
                })
                    .then(
                        /**
                         * @param {Message} message
                         */
                        async (message) => {
                            const giveawayData = {
                                winners: winners,
                                startedTimestamp: Date.now(),
                                endTimestamp: (Date.now() + ms(duration)),
                                messageId: message.id,
                                channelId: message.channelId,
                                prize: prize,
                                host: interaction.user.id,
                                participants: []
                            };
                            client._fs.writeFileSync(`./giveaways/${message.id}.yml`, yaml.dump(giveawayData));

                            await interaction.reply({
                                embeds: [ embeds.giveawaysended(message.url) ],
                                ephemeral: true
                            });

                            client.log("GIVEAWAY".magenta + ` Création du giveaway '${prize}'`);

                            if (ms(duration) < 1000 * 60 * 15)client.giveaway.lastTime(message.id, ms(duration));
                    })
            }break;
            case "supprimer" : {
                const giveawayId = interaction.options.getString("giveaway");

                const giveaway = yaml.load(client._fs.readFileSync(`./giveaways/${giveawayId}.yml`));

                const channel = await client.channels.fetch(giveaway.channelId);
                const message = await channel.messages.fetch(giveaway.messageId);

                await message.delete();

                client._fs.rmSync(`./giveaways/${giveawayId}.yml`);

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription(`Le giveaway **${giveaway.prize}** a été supprimé.`)
                    ],
                    ephemeral: true
                });

                client.log("GIVEAWAY".magenta + ` Suppression du giveaway '${giveaway.prize}'`);
            }break;
            case "terminer" : {
                const giveawayId = interaction.options.getString("giveaway");

                const giveaway = yaml.load(client._fs.readFileSync(`./giveaways/${giveawayId}.yml`));
                giveaway.endTimestamp = Date.now();
                client._fs.writeFileSync(`./giveaways/${giveawayId}.yml`, yaml.dump(giveaway));

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Orange)
                            .setDescription(`Le giveaway **${giveaway.prize}** a été terminé.`)
                    ],
                    ephemeral: true
                });


                client.log("GIVEAWAY".magenta + ` Fin du giveaway '${giveaway.prize}'`);

                client.giveaway.lastTime(giveawayId, 0)
            }break;
            case "reroll" : {
                const giveaway = yaml.load(client._fs.readFileSync(`./giveaways/ended/${interaction.options.getString("giveaway")}.yml`));

                const channel = await client.channels.fetch(giveaway.channelId);
                /**
                 *
                 * @type {Message}
                 */
                const message = await channel.messages.fetch(giveaway.messageId);
                let participants = [...giveaway.participants];

                const winners = [...Array(Math.min(giveaway.winners, participants.length)).keys()].map(x => {
                    if (participants.length - (x + 1) < 0)return;
                    let index = rand(0, participants.length - (x + 1));
                    const winner = participants[index];
                    participants.splice(index, 1);
                    return winner;
                });

                function rand(min, max){
                    return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
                };

                message.edit({
                    embeds: [
                        new EmbedBuilder(message.embeds[0]),
                        new EmbedBuilder()
                            .setColor(Colors.Green)
                            .setDescription(`Bien joué à <@${winners.join(">, <@")}> pour [${giveaway.prize}](${message.url})`)
                            .setTimestamp()
                    ],
                });

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blurple)
                            .setDescription("Le giveaway a été reroll.")
                    ],
                    ephemeral: true
                })

                client.log("GIVEAWAY".magenta + ` Reroll du giveaway '${giveaway.prize}'`);
            }break;
        }
    },
}

const embeds = {
    UnknowTime: () => new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(
            "La durée du giveaway est invalide !\n"+
            "- **Semaine** : ` w `\n"+
            "- **Jour** : ` d `\n"+
            "- **Heure** : ` h `\n"+
            "- **Minute** : ` m `\n"+
            "- **Seconde** : ` s `\n"
        ),
    giveawayEmbed: (prize, hostid, endTimestamp, winners) => new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setTitle(prize)
        .setDescription(
            `Créé par: <@${hostid}>\n`+
            `Termine <t:${endTimestamp}:R>\n`+
            `Nombre de gagnant: ${winners}\n`
        )
        .setTimestamp(),
    giveawaysended: (url) => new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(`Le giveaway à été créer avec succès ! [Voir le message](${url})`)
}