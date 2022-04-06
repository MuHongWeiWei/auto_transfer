let Web3 = require('web3');
const privateKey = "04e1888ce1eb4e9b30eef876baa1309cfe854fbaa5f9b6844ea0a3e9ee003672";
const currentAccount = "0x8e09D6B568d07405dd57b5Dd96D97CF8C9670b5c";
//  交易目的地址
const addressTo = '0x4368c224665CC098A70FE4C1322218ae03511395';
const g_gasLimit = 21000

let web3;
let justTransfer = 0;
let lastTime = new Date().getTime();

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-2-s3.binance.org:8545"));
}

start().then()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
    console.log('開始')
    while (true) {
        if (justTransfer === 2) {
            console.log('\nWAIT 0.5s FOR NEXT TRANS.\n')
            await sleep(500);
            justTransfer = 0;
        }
        if (justTransfer === 3) {
            console.log('\nLAST TRANS FAILED!\n')
            justTransfer = 0;
        }
        if (justTransfer === 1) {
            await sleep(6000);
            continue;
        }

        let amountTemp = await web3.eth.getBalance(currentAccount);
        const gasPrice = await web3.eth.getGasPrice()
        const gasFee = g_gasLimit * gasPrice;
        amountTemp = amountTemp - gasFee;

        if (amountTemp > 0) {
            justTransfer = 1;
            lastTime = new Date().getTime();
            await deploy(amountTemp);
        } else {
            console.log('BNB amount not enough: ', amountTemp);
        }
    }
}

async function deploy(amount) {
    console.log('from: ' + currentAccount + '\nsend amount: ' + amount + '\nto : ' + addressTo);
    const gasPrice = await web3.eth.getGasPrice()

    const createTransaction = await web3.eth.accounts.signTransaction({
        from: currentAccount,
        to: addressTo,
        value: web3.utils.toWei(amount.toString(), 'wei'),
        gas: g_gasLimit,
        gasPrice: gasPrice
    }, privateKey);

    try {
        web3.eth.sendSignedTransaction(createTransaction.rawTransaction, function (err, hash) {
            if (!err) {
                console.log("完成交易，用時：" + (new Date().getTime() - lastTime) + ` ms\ntrans hash : ${hash}`)
                lastTime = new Date().getTime();
                justTransfer = 2;
            } else {
                console.log(err.toString().substr(0,100));
                justTransfer = 3;
            }
        });
    } catch (e) {
        console.log(e.toString().substr(0, 100));
        justTransfer = 3;
    }
}