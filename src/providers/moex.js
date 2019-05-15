const axios = require('axios');

const BaseProvider = require('../base/BaseProvider');

module.exports = class MoexProvider extends BaseProvider {
    constructor(app) {
        super(app);

        // api doc http://iss.moex.com/iss/reference/
        this.url = 'https://iss.moex.com/iss/engines/currency/markets/selt/boards/CETS/securities/USD000UTSTOM.json';

        // Inverse to rub_usd for get usd rate
        this.USD_RUB = 'usd_rub';
        this.RUB_USD = 'rub_usd';

        this.intervalSec = 30;

        this._fetchRate = this._fetchRate.bind(this);
    }

    start() {
        return this._fetchRate();
    }

    _fetchRate()  {
        return axios.get(this.url)
            .then(response => {
                const json = response.data;
                const rate = json.marketdata.data[0][8];
                if (rate > 0) {
                    this.setRates([
                        [this.USD_RUB, rate],
                        [this.RUB_USD, 1 / rate],
                    ]);
                }

                setTimeout(this._fetchRate, this.intervalSec * 1000);
            })
            .catch(error => {
                this.error('Axios error: ' + error.toString());
                setTimeout(this._fetchRate, this.intervalSec * 1000);
            });
    }
};
