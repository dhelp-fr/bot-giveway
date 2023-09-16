Object.defineProperty(String.prototype, 'black', {
    get: function () {
        return "\x1b[30m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'red', {
    get: function () {
        return "\x1b[31m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'green', {
    get: function () {
        return "\x1b[32m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'yellow', {
    get: function () {
        return "\x1b[33m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'blue', {
    get: function () {
        return "\x1b[34m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'magenta', {
    get: function () {
        return "\x1b[35m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'cyan', {
    get: function () {
        return "\x1b[36m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'white', {
    get: function () {
        return "\x1b[37m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'grey', {
    get: function () {
        return "\x1b[90m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'bright', {
    get: function () {
        return "\x1b[1m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'reverse', {
    get: function () {
        return "\x1b[7m" + this + "\x1b[0m";
    }
});

Object.defineProperty(String.prototype, 'underline', {
    get: function () {
        return "\x1b[4m" + this + "\x1b[0m";
    }
});