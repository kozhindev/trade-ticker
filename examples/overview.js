const Ticker = require('../src/Ticker');

const ticker = new Ticker({
    pairs: {
        binance: {
            btc_usd: 'BTCUSDT',
            eth_usd: 'ETHUSDT',
            etc_usd: 'ETCUSDT',
            neo_usd: 'NEOUSDT',
            eos_usd: 'EOSUSDT',
            ltc_usd: 'LTCUSDT',
            xrp_usd: 'XRPUSDT',
            xlm_usd: 'XLMUSDT',
            ada_usd: 'ADAUSDT',
            qtum_usd: 'QTUMUSDT',
            trx_usd: 'TRXUSDT',
            icx_usd: 'ICXUSDT',
            bch_usd: 'BCHABCUSDT',
            miota_btc: 'IOTABTC',
            miota_usd: 'IOTAUSDT',
        },
        bitforex: {
            eth_usd: 'coin-usdt-eth',
            jct_eth: 'coin-eth-jct',
        },
        bitmax: {
            etz_usd: 'ETZ/USDT',
        },
        moex: {
            usd_rub: 'usd_rub',
        },
        poloniex: {
            btc_usd: 'USDT_BTC',
            eth_usd: 'USDT_ETH',
            etc_usd: 'USDT_ETC',
            eos_usd: 'USDT_EOS',
            ltc_usd: 'USDT_LTC',
            xrp_usd: 'USDT_XRP',
            qtum_usd:'USDT_QTUM',
        },
    },
});
ticker.onLog((type, message) => console[type](message));
ticker.onTicker((providerName, items) => console.log(providerName, items));
ticker.start();
