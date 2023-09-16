import {ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder} from "discord.js";
import yaml from "js-yaml";

export class GiveawayManager {

    /**
     * @type {DhelpClient}
     */
    client;

    /**
     * @type {boolean}
     */
    on;

    /**
     *
     * @param {DhelpClient} client
     */

    constructor(client) {
        this.client = client;
        if (!this.client._fs.existsSync("./giveaways")){
            this.client._fs.mkdirSync("./giveaways");
            this.client._fs.mkdirSync("./giveaways/ended")
        }

        this.loop();
        setInterval(() => {
            this.loop();
        }, 15 * 60 * 1000)
    }

    async loop() {
        /**
         * @type {{
             winners: number,
             startedTimestamp: number,
             endTimestamp: number,
             messageId: string,
             prize: string,
             channelId: string,
             host: string,
             participants: string[]
         }[]}
         */
        const giveaways = await Promise.all(this.client._fs.readdirSync("./giveaways").filter(x => x.endsWith(".yml")).map(async x => yaml.load(this.client._fs.readFileSync(`./giveaways/${x}`))));

        for (let giveaway of giveaways)
        {
            const remaining = giveaway.endTimestamp - Date.now();
            if (remaining <= 1000 * 60 * 15) this.lastTime(giveaway.messageId, remaining);
        }
    }

    lastTime(giveawayId, time_remaining) {
        setTimeout(async () => {
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
             }}
             */
            const giveaway = yaml.load(this.client._fs.readFileSync(`./giveaways/${giveawayId}.yml`));

            try {
                const channel = await this.client.channels.fetch(giveaway.channelId);
                /**
                 *
                 * @type {Message}
                 */
                const message = await channel.messages.fetch(giveaway.messageId);
                let participants = [...giveaway.participants];

                const winners = [...Array(Math.min(giveaway.winners, participants.length)).keys()].map(x => {
                    if (participants.length - (x + 1) < 0)return;
                    let index = rollRands(0, participants.length - (x + 1), 3);
                    const winner = participants[index];
                    participants.splice(index, 1);
                    return winner;
                });

                const embed = new EmbedBuilder(message.embeds[0]);
                message.edit({
                    content: ":tada::tada: **GIVEAWAY TERMINÉ** :tada::tada:",
                    embeds: [
                        embed
                            .setColor(Colors.Red)
                            .setDescription(
                                `Créé par: <@${giveaway.host}>\n`+
                                `Termine <t:${giveaway.endTimestamp}:R>\n`+
                                `Nombre de gagnant: ${giveaway.winners}\n`
                            )
                            .setFooter({text: "Terminé depuis"})
                            .setTimestamp(),
                        new EmbedBuilder()
                            .setColor(Colors.Green)
                            .setDescription(`Bien joué à <@${winners.join(">, <@")}> pour [${giveaway.prize}](${message.url})`)
                            .setTimestamp()
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setDisabled(true)
                                .setLabel(giveaway.participants.length.toString())
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji("🎉")
                                .setCustomId("1"),
                        )
                    ]
                });

            } catch {

            }

            this.client._fs.rmSync(`./giveaways/${giveawayId}.yml`);
            this.client._fs.writeFileSync(`./giveaways/ended/${giveawayId}.yml`, yaml.dump(giveaway));

            this.client.log("GIVEAWAY".magenta + ` Fin du giveaway '${giveaway.prize}'`);

        }, time_remaining)
    }
}


function rand(min, max){
    return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
}

function rollRands(min, max, rolls) {
    let counts = {};
    for(let i = min; i <= max; i++) {
        counts[i] = 0
    }
    let roll = 0;
    while (roll < rolls) {
        counts[rand(min,max)]++;
        roll++;
    }
    return Number(Object.entries(counts).find(x => x[1] === Math.max(...Object.values(counts)))[0]);
}