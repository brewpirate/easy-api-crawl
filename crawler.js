import Crawler from 'crawler';
import UserAgent from 'user-agents';
import fs from 'fs';
import csv from 'fast-csv';
import getProxyList from './proxy.js';
import { SocksProxyAgent } from 'socks-proxy-agent';



// User variables
// TODO: YARGS!
const baseUrl = 'https://ipinfo.io/?';
const startId = 1;
const endId   = 2;
const goStealth = true;


// Script Variables
const payload = `${startId}-${endId}.csv`
const csvFile = fs.createWriteStream(payload);
let csvHeaders = null;
let csvStream = null;
let currentId = startId;
let proxyList = [];


// START

// Create Proxylist
if (goStealth) {
    await loadProxyList();
}

// Create Crawler
const crawlerInstance = new Crawler({
    jQuery: false, 
    method: 'GET',
    http2: false,
    // debug: true,
    retries: 0,
    retryTimeout: 0,

    // Allow the ability to change the proxy and UserAgent for each request
    //TODO: Use proxy for X number of requests
    preRequest: (options, done) => {
        const crawlerOptions = {
            rateLimit: getRandomRatelimit(),
            userAgent: userAgent(),
            referer: !goStealth,
            removeRefererHeader: !goStealth,
        };

        if (goStealth) {
            const crawlProxy = getRandomProxy();

            options.agentClass= SocksProxyAgent;
            options.strictSSL = true;
            options.agentOptions = {
                hostname: crawlProxy.host,
                port: crawlProxy.port,
            }
        }
        // console.log(options);

    	// when done is called, the request will start
    	done();
    },
    callback: (error, res, done) => {
        if (error) {
            console.log('!!!!!', error, res.options);
        } else {
            const formattedResponse = JSON.parse(res.body)[0];
            let message = 'No data found.'
            
            // TODO: ALLOW FOR CUSTOM RESPONSE HANDLER
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
            // options : crawlerOptions,
        });
    currentId++;
}

// Finished
crawlerInstance.on('drain', () => {
    if (csvStream) {
        csvStream.end();
    }
});



/**
 * HELPERS 
 * TODO: MOVE OUT OF CRAWLER
 */
async function loadProxyList() {
    proxyList = await getProxyList();
}

function getRandomProxy() {
    return proxyList[getRandom(1, proxyList.length)];
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}   

function getQueuSize() {
    return crawlerInstance.queueSize;
}

function userAgent() {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' })
    return userAgent.toString();
}

function getRandomRatelimit(min = 1000, max = 10000) {
    return getRandom(max, min);
}

