import {DhelpClient} from "../Client.js";
import {EventHandler} from "./eventHandler.js";
import {SlashCommandHandler} from "./slashCommandHandler.js";
import * as path from "path";
export class DHelpHandler {
    /**
     *
     * @type {DhelpClient}
     */
    client;
    /**
     *
     * @type {EventHandler}
     */
    events;
    /**
     *
     * @type {SlashCommandHandler}
     */
    slashcommands;

    /**
     *
     * @param {DhelpClient} client
     */
    constructor(client) {
        this.client = client;
        this.events = new EventHandler(this);
    }

    /**
     *
     * @param {EventHandler | SlashCommandHandler} handler
     * @param {string} path2
     */
    async getFiles(handler, path2) {
        const files = this.client._fs.readdirSync(path2);
        return Promise.all(
            files.filter(x => !x.includes(".disabled"))
                .map(async x => {
                    if (x.includes(".js")) return await handler.registerFile(`${path2}/${x}`);
                    await this.getFiles(handler, `${path2}/${x}`);
                })
        );
    }
}