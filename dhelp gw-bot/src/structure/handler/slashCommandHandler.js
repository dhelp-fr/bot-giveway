import {DHelpHandler} from "./main.js";
import {Collection, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import * as path from "path";

export class SlashCommandHandler {
    /**
     *
     * @type {DHelpHandler}
     */
    handler;
    /**
     *
     * @type {Collection<string, {data: SlashCommandBuilder, execute: Function, autocomplete: Function}>}
     */
    slashCommandList;
    /**
     *
     * @type {number}
     */
    #startedAt;

    /**
     *
     * @param {DHelpHandler} handler
     * @param {number} started
     */
    constructor(handler, started) {
        this.#startedAt = started;
        this.handler = handler;
        this.slashCommandList = new Collection();
        this.init();
    }
    async init() {
        await this.handler.getFiles(this, path.resolve() + "/src/interactions/slashcommands");
    }

    /**
     *
     * @param {string} path
     */
    async registerFile(path) {
        const command = (await import("file:///" +path)).default;
        try {
            this.slashCommandList.set(command.data.name, command);
            this.handler.client.log("SlashCommands".green + ` - Ajout de la commande `.white + `${command.data.name}`.white.underline +` (${(Date.now() - this.#startedAt)/1000}s)`.white);
            return;
        } catch {
            this.handler.client.error("SlashCommands".green + ` - Erreur de lecture de la commande ${path.split("/").pop()}!`.red);
            return;
        }
    }
}