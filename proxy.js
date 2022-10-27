import got from 'got';

const proxyList = 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt';


export default async function getProxyList() { 
    const response = await got.get(proxyList,);
    const data = response.body;
    const formattedResponse = formatResponse(data);
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