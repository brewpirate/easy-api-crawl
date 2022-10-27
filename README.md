# easy-api-crawl
Crawls an endpoint with incrimental ids and outputs the response body to csv.

## How to make it do things
Until there are script args go old skool

npm run crawl

### baseUrl
- The target url
### startId
- Start id
### endId
- Ending id
### goStealth
- Creates a new desktop User-Agent with [user-agents](https://github.com/intoli/user-agents) [docs](https://github.com/bda-research/node-crawler#http-headers)
- Disables referer [docs](https://github.com/bda-research/node-crawler#http-headers)
- Removes Refer Header [docs](https://github.com/bda-research/node-crawler#http-headers)
