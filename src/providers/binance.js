const axios = require('axios');
const WebSocketClient = require('websocket').client;

const BaseProvider = require('../base/BaseProvider');

module.exports = class BinanceProvider extends BaseProvider {

    constructor() {
        super(...arguments);

        this.apiUrl = 'https://api.binance.com/api/v1';
        this.wsUrl = 'wss://stream.binance.com:9443/stream';

        this._streams = [];

        this.TICKER_CHANNEL = '!miniTicker@arr';
    }

    start() {
        // Create ws client
        this._client = new WebSocketClient();
        this._client.on('connectFailed', this._onError.bind(this));
        this._client.on('connect', this._onConnect.bind(this));

        // Fetch symbols info
        return axios.get(this.apiUrl + '/ticker/24hr')
            .then(response => {
                this._streams = [this.TICKER_CHANNEL];

                this.setRates(response.data.map(item => ([
                    item.symbol,
                    item.lastPrice,
                ])));

                // Listen stream
                this._client.connect(this.wsUrl + '?streams=' + this._streams.join('/'));
            })
            .catch(error => {
                this.error('Axios error: ' + error.toString());
            });
    }

    stop() {
        this._streams = [];
        if (this._client) {
            this._client.abort();
        }
    }

    _onConnect(connection) {
        this.info('WebSocket Client Connected');

        connection.on('error', this._onError.bind(this));
        connection.on('close', this._onClose.bind(this));
        connection.on('message', this._onMessage.bind(this));
    }

    _onMessage(message) {
        if (message.type === 'utf8') {
            const json = JSON.parse(message.utf8Data);
            if (json.stream === this.TICKER_CHANNEL) {
                this.setRates(json.data.map(item => ([
                    item.s,
                    item.c,
                ])));
            }
        }
    }

    _onError(error) {
        this.error('Connect Error: ' + error.toString());
    }

    _onClose() {
        this.info('Connection Closed');

        // Try reconnect
        if (this._streams.length > 0) {
            this._client.connect(this.wsUrl + '?streams=' + this._streams.join('/'));
        }

    }
};
