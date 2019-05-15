const _get = require('lodash/get');
const _extend = require('lodash/extend');
const _findKey = require('lodash/findKey');

const providers = require('./providers');

module.exports = class Ticker {

    constructor(config) {
        this._config = {
            providers: {},
            pairs: {},
            ...config,
        };

        // Handler
        this._logHandler = null;
        this._tickerHandler = null;

        // Create provider instances
        this._providers = Object.keys(providers).map(name => {
            const provider = new providers[name];
            provider.name = name;
            provider.ticker = this;

            const pairsMap = this._config.pairs[name] || {};
            provider.symbols = Object.keys(pairsMap).map(key => pairsMap[key]);

            _extend(provider, _get(this._config.providers, name));
            return provider;
        });
    }

    start() {
        this._providers.forEach(provider => {
            if (this._config.pairs[provider.name]) {
                this.log('info', this.constructor.name, `Start ${provider.name} provider...`);
                provider.start();
            }
        });
    }

    setRates(providerName, items) {
        items = items
            .map(item => ([
                _findKey(this._config.pairs[providerName], symbol => symbol === item[0]),
                item[1],
            ]))
            .filter(item => item[0]);

        if (items.length > 0 && this._tickerHandler) {
            this._tickerHandler(providerName, items);
        }
    }

    onLog(handler) {
        this._logHandler = handler;
    }

    onTicker(handler) {
        this._tickerHandler = handler;
    }

    log(level, category, message) {
        if (this._logHandler) {
            this._logHandler(
                'info',
                [
                    (new Date()).toISOString(),
                    category,
                    message
                ].join(' ')
            );
        }
    }

    _getAvailableSymbols(providerName) {
        const pairsMap = this._config.pairs[providerName] || {};
        return Object.keys(pairsMap).map(key => pairsMap[key]);
    }

};
