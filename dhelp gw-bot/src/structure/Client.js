import {Client, IntentsBitField} from "discord.js";
import {DHelpHandler} from "./handler/main.js";
import {Config} from "./Config.js";
import * as fs from "fs";
import {GiveawayManager} from "./Manager.js";

export class DhelpClient extends Client {
    /**
     *
     * Main hex color
     * @type {string}
     */
    color = "#9134f4";

    /**
     *
     * @public
     * @type {fs}
     */
    _fs;

    /**
     * @type {GiveawayManager}
     */
    giveaway;

    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
            ]
        });
        this._fs = fs;
        void this.init();
    }

    async init() {
        this.config = new Config(this);
        console.log("  ██████╗ ██╗  ██╗███████╗██╗     ██████╗ \n  ██╔══██╗██║  ██║██╔════╝██║     ██╔══██╗\n  ██║  ██║███████║█████╗  ██║     ██████╔╝       "+"Version: ".yellow+this.config.data.developer.version+" \n  ██║  ██║██╔══██║██╔══╝  ██║     ██╔═══╝     "+"Denière Update: ".yellow+this.config.data.developer.lastUpdate+" \n  ██████╔╝██║  ██║███████╗███████╗██║           "+ "Développeur:".yellow+  " Ifanoxy\n  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     \n");
        this.log("Lancement des handlers...".white);
        await this.startHandler();
        await this.connect();
        this.addSlashCommands();
        process.on("unhandledRejection", (reason) => {
            this.error(reason)
        });
        process.on("rejectionHandled", (reason) => {
            this.error(reason)
        });
        this.giveaway = new GiveawayManager(this);
    }

    async startHandler() {
        this.handler = new DHelpHandler(this);
    }

    connect() {
        return this.login(this.config.data.client.token || process.env.CLIENT_TOKEN)
            .then(() => {
                this.log("Le client ".white + this.user.username.blue + " est en ligne!".white, 1)
            })
            .catch(reason => {
                throw reason
            })
    }

    addSlashCommands() {
        this.application.commands.set(this.handler.slashcommands.slashCommandList.map(x => x.data.toJSON()))
            .then(r => {
                this.log("Ajout de ".white + `${r.size}`.green + " slash commands".white);
            })
            .catch(reason => {
                this.error(`Il y a eu une erreur lors de l'ajout des slash commands! (${reason})`.red)
            })
    }

    /**
     *
     * @param {string} message
     * @param {number} tab
     */
    log(message, tab = 0) {
        console.log("\n".repeat(tab) + "[".grey.bright + "DHelp".magenta.bright + "]".grey.bright, message, "\n".repeat(tab));
    }

    /**
     *
     * @param {string | Error} error
     * @param {number} tab
     */
    error(error, tab = 0) {
        console.log("\n".repeat(tab) + "⚠️" + "[".grey.bright + "DHelp".magenta.bright + "]".grey.bright, (error instanceof Error ? (error.message.red + "\n" + error.stack) : error), "\n".repeat(tab))
    }
}