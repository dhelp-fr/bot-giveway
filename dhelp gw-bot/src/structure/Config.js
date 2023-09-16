import {DhelpClient} from "./Client.js";
import * as yaml from "js-yaml";
import {DHelpError} from "./Error.js";
import {ActivityType, PresenceUpdateStatus} from "discord-api-types/v10";
export class Config {
    /**
     * @type {ConfigInterface}
     */
    data;

    /**
     *
     * @param {DhelpClient} client
     */
    constructor(client) {
        this._client = client;
        this.data = this.#readFile();
    }

    /**
     *
     * @returns {*}
     */
    #readFile() {
        return yaml.load(this._client._fs.readFileSync(process.cwd() + "/config.yml", "utf-8"));
    }

    /**
     *
     * @param {any} value
     * @param {string} key
     */
    edit(value, ...key) {
        try {
            let Data = this.#readFile();
            switch (key.length) {
                case 1 : Data[key[0]] = value;
                    break;
                case 2 : Data[key[0]][key[1]] = value;
                    break;
                case 3 : Data[key[0]][key[1]][key[2]] = value;
                    break;
            }
            this._client.log("Config".magenta + ` - Edit ${key.join(".")} -> ${typeof value == "object" ? JSON.stringify(value) : value}`)
            this._client._fs.writeFileSync(process.cwd() + "/config.yml", yaml.dump(Data));
            this.data = Data;
        } catch (e) {
            throw new DHelpError(`Echec de la sauvegarde dans la config (${e})`)
        }
    }
}

class ConfigInterface {
    /**
     *
     * @type {
     * {
     *  token: string,
     *  presence: {
     *   enable: boolean,
     *   status: PresenceUpdateStatus,
     *   activity: {
     *    name: string,
     *    type: ActivityType
     *   }[]
     *  }
     * }
     * }
     */
    client;
    /**
     *
     * @type {
     * {
     *  lastUpdate: string,
     *  version: string
     * }
     * }
     */
    developer;
}