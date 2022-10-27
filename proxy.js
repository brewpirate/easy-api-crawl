import got from 'got';

// TODO: ABILITY TO SPECIFY PROXY SOURCES
const proxyList = 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt';


export default async function getProxyList() { 
    const response = await got.get(proxyList,);
    const data = response.body;
    const formattedResponse = formatResponse(data);
    // return await filterProxyList(formattedResponse)
    return formattedResponse;
}

function formatResponse(response) {
    const chunked = response.split("\n")
    return chunked.map((line) => {
        const [host, port] = line.split(":");
        return {
            host,
            port,
        }
    });
}

// TODO: ABILITY TO BLACKLIST PROXIES
// function badProxy(proxyList) {
//     return proxyList;
// }

//TODO: PROXY CLEANUP
// async function filterProxyList(proxyList) {
//     return await proxyList;
//}