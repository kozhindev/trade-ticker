const axios = require('axios');
const WebSocketClient = require('websocket').client;

const BaseProvider = require('../base/BaseProvider');

module.exports = class BitmaxProvider extends BaseProvider {

    constructor(app) {
        super(app);

        this.apiUrl = 'https://bitmax.io/api/v1';
        this.wsUrl = 'wss://bitmax.io/api/public';

    }

    start() {
        // Create ws client
        this._client = new WebSocketClient();
        this._client.on('connectFailed', this._onError.bind(this));
        this._client.on('connect', this._onConnect.bind(this));

        // Fetch symbols info
        this.info('Fetch initial state...');

        return axios.get(this.apiUrl + '/ticker/24hr')
            .then(response => {
                this.setRates(response.data.map(item => ([
                    item.symbol,
                    item.closePrice,
                ])));

                // Для подключения к сокетам обязательно надо указать symbol (валютную пару),
                // однако по сообщения валятся по всем валютам
                this._client.connect(this.wsUrl + '/' + this.symbols[0].replace('/', '-'));
            })
            .catch(error => {
                this.error('Axios error: ' + error.toString());
            });
    }

    stop() {
        if (this._client) {
            this._client.abort();
        }
    }

    _onConnect(connection) {
        this.info('WebSocket Client Connected');

        connection.on('error', this._onError.bind(this));
        connection.on('close', this._onClose.bind(this));
        connection.on('message', this._onMessage.bind(this));

        connection.send(JSON.stringify({
            'messageType': 'subscribe',
            'marketDepthLevel': 1,
            'recentTradeMaxCount': 1,
        }));
    }

    _onMessage(message) {
        if (message.type === 'utf8') {
            const json = JSON.parse(message.utf8Data);
            if (json.m === 'summary') {
                this.setRates([[json.s, json.c]]);
            }
        }
    }

    _onError(error) {
        this.info('Connect Error: ' + error.toString());
    }

    _onClose() {
        this.info('Connection Closed');

        // Try reconnect
        this._client.connect(this.wsUrl + '/' + this.symbols[0].replace('/', '-'));
    }
};
