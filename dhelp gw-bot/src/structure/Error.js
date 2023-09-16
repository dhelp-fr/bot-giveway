export class DHelpError extends Error {
    /**
     *
     * @param {string} message
     */
    constructor(message) {
        super(message);
        this.name = "DHelp Error";
        Error.captureStackTrace(this, this.constructor);
    }
}