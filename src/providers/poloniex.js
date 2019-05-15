const axios = require('axios');
const WebSocketClient = require('websocket').client;

const BaseProvider = require('../base/BaseProvider');

module.exports = class PoloniexProvider extends BaseProvider {

    constructor(app) {
        super(app);

        this.apiUrl = 'https://poloniex.com/public?command=returnTicker';
        this.wsUrl = 'wss://api2.poloniex.com/';

        this._pairIds = {};

        this.TICKER_CHANNEL = 1002;
    }

    start() {
        // Create connection
        this._client = new WebSocketClient();
        this._client.on('connectFailed', this._onError.bind(this));
        this._client.on('connect', this._onConnect.bind(this));

        // Fetch initial state
        this.info('Fetch initial state...');
        return axios.get(this.apiUrl)
            .then(response => {
                // Store ids
                Object.keys(response.data).forEach(name => {
                    this._pairIds[response.data[name].id] = name;
                });

                // Set initial
                this.setRates(Object.keys(response.data).map(name => ([
                    name,
                    response.data[name].last,
                ])));

                // Listen stream
                this._client.connect(this.wsUrl);
            })
            .catch(error => {
                this.error('Error on fetch initial state: ' + error.toString());
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

        connection.sendUTF(JSON.stringify({
            command: 'subscribe',
            channel: this.TICKER_CHANNEL,
        }));
    }

    _onMessage(message) {
        if (message.type === 'utf8') {
            const json = JSON.parse(message.utf8Data);
            if (json[0] === this.TICKER_CHANNEL) {
                // [1002,null,[27,"0.00000094","0.00000094","0.00000093","-0.06930693","472.79505330","499040793.42470906",0,"0.00000101","0.00000089"]]
                json.slice(2).forEach(item => {
                    let pairName = this._pairIds[item[0]];
                    if (pairName) {
                        this.setRates([[pairName, item[1]]]);
                    }
                });
            }
        }
    }

    _onError(error) {
        this.info('Connect Error: ' + error.toString());
    }

    _onClose() {
        this.info('Connection Closed');
    }
};
