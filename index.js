const request = require('request');
const open = require('open');

const kittiesPerPage = 100;

function getKitties(max, speed, page = 0, currKitties = [], resolver) {
    let promise = new Promise(resolve => resolver = resolver || resolve);

    request({
        url: `http://api.cryptokitties.co/auctions?offset=${kittiesPerPage * page}&limit=${kittiesPerPage}&&type=sale&status=open`,
        json: true
    }, (err, response, body) => {
        currKitties = [...currKitties, ...body.auctions.filter(k => k.kitty.status.cooldown_index === speed)];

        if (currKitties.length < max) {
            getKitties(max, speed, page + 1, currKitties, resolver);
        } else {
            currKitties.sort((a, b) => a.current_price - b.current_price);
            currKitties = currKitties.slice(0, max);
            resolver(currKitties);
        }
    });

    return promise;
}

getKitties(5, 0)
    .then(kitties => {
        kitties
            .map(k => `https://www.cryptokitties.co/kitty/${k.kitty.id}`)
            .forEach(url => setImmediate(() => open(url)));
    });