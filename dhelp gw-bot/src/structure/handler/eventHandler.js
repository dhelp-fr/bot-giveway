import {DHelpHandler} from "./main.js";
import {SlashCommandHandler} from "./slashCommandHandler.js";
import * as path from "path";

export class EventHandler {
    /**
     *
     * @type {DHelpHandler}
     */
    handler;
    /**
     *
     * @type {number}
     */
    #startedAt;

    /**
     *
     * @param {DHelpHandler} handler
     */
    constructor(handler) {
        this.handler = handler;
        this.init();
    }

    async init() {
        this.#startedAt = Date.now();
        await this.handler.getFiles(this, path.resolve() + "/src/events");
        this.handler.slashcommands = new SlashCommandHandler(this.handler, this.#startedAt);
    }

    /**
     *
     * @param {string} path
     * @returns {Promise<void>}
     */
    async registerFile(path) {
        const event = (await import("file:///" +path)).default;
        try {
            this.handler.client.on(event.name, (...args) => {
                try {
                    event.execute(this.handler.client, ...args)
                } catch (e) {
                    this.handler.client.error(e)
                }
            });
            this.handler.client.log("Events".green + ` - Ajout de l'event `.white + `${event.name}`.white.underline +` (${(Date.now() - this.#startedAt)/1000}s)`.white);
            return;
        } catch {
            this.handler.client.error("Events".green + ` - Erreur de lecture de l'event ${path.split("/").pop()}!`.red);
            return;
        }
    }
}