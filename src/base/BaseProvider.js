module.exports = class BaseProvider {

    constructor(ticker) {
        this.name = '';
        this.symbols = [];
        this.ticker = ticker;
    }

    start() {
    }

    stop() {
    }

    setRates(items) {
        this.ticker.setRates(this.name, items);
    }

    debug(message) {
        this.ticker.log('debug', this.constructor.name, message);
    }

    info(message) {
        this.ticker.log('info', this.constructor.name, message);
    }

    error(message) {
        this.ticker.log('error', this.constructor.name, message);
    }
};
