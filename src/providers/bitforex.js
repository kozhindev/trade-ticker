const axios = require('axios');

const BaseProvider = require('../base/BaseProvider');

module.exports = class BitforexProvider extends BaseProvider {

    constructor(app) {
        super(app);

        this.apiUrl = 'https://api.bitforex.com/api/v1';
        this.intervalSec = 10;

        this.fetchRates = this.fetchRates.bind(this);
    }

    start() {
        return this.fetchRates();
    }

    fetchRates() {
        return Promise.all(
            this.symbols.map(symbol => {
                return axios.get(this.apiUrl + '/market/ticker?symbol=' + symbol)
                    .then(response => {
                        if (response.data.success) {
                            this.setRates([[
                                symbol,
                                response.data.data.last,
                            ]]);
                        }
                    })
                    .catch(error => {
                        this.error('Axios error: ' + error.toString());
                    });
            })
        )
            .then(() => setTimeout(this.fetchRates, this.intervalSec * 1000));
    }
};
