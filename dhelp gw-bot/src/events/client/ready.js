import {Events} from "discord.js";
import {DhelpClient} from "../../structure/Client.js";
import {DHelpError} from "../../structure/Error.js";

export default {
    name: Events.ClientReady,
    /**
     *
     * @param {DhelpClient} client
     */
    async execute(client) {
        try {
            const {presence} = client.config.data.client;
            if (presence?.enable) {
                client.user.setPresence({
                    status: presence.status,
                    activities: presence.activity,
                })
            }
        } catch {
            throw new DHelpError("Une erreur c'est produite dans la config! (presence)")
        }
    }
}