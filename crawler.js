import Crawler from 'crawler';
import UserAgent from 'user-agents';
import fs from 'fs';
import csv from 'fast-csv';

// User variables
const baseUrl = 'https://www.yomomma.com/?page=';
const startId = 1;
const endId   = 100;
const goStealth = true;

// Script Variables
const payload = `${startId}-${endId}.csv`
const csvFile = fs.createWriteStream(payload);
let csvHeaders = null;
let csvStream = null;
let currentId = startId;


// Crawler
const crawlerInstance = new Crawler({
    // rateLimit: 10,
    // maxConnections: 100,
    jQuery: false, 
    method: 'GET',
    strictSSL: true,
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const formattedResponse = JSON.parse(res.body)[0];
            let message = 'No data found.'

            if (formattedResponse !== undefined ){
                if(!csvHeaders) {
                    console.log('setting headers')
                    csvHeaders = Object.keys(formattedResponse) 
                    csvStream = csv.format({ 
                        includeEndRowDelimiter: true, 
                        headers: csvHeaders
                    });
                    csvStream.pipe(csvFile);
                }
                csvStream.write(formattedResponse);
                message = 'Recorded.'
            }
            console.log(`${message} ${getQueuSize()} items in queue`)
        }
        done();
    }
});

// Build Queue
while (currentId < endId) {
    console.log(`${getQueuSize()} items to process`);
    crawlerInstance.queue(
        {
            uri: `${baseUrl}${currentId}`,
            options : {
                rateLimit: getRandomRatelimit(),
                rotateUA: goStealth,
                userAgent: userAgent(),
                referer: !goStealth,
                removeRefererHeader: !goStealth,
            }
        });
    currentId++;
}

// Finished
crawlerInstance.on('drain', () => {
    if (csvStream) {
        csvStream.end();
    }
});

function getQueuSize() {
    return crawlerInstance.queueSize;
}

 function userAgent() {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' })
    return userAgent.toString();
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}   

function getRandomRatelimit(min = 1000, max = 10000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

