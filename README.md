# sanity-proxy

This proxy was written by Stefan Klinkusch at Daizu GmbH/sleep.ink in 2020. It
helps to fetch data from the [Sanity
API](https://8yon6w8q.api.sanity.io/v1/data/query/production) without having the
CORS error.

Usage: `https://sanity.sklinkusch.now.sh/?<QUERY>`

`<QUERY>` has the following components:

- `query` (necessary): which elements should be queried, e.g.
  `query=*[_type='page']`
- `projectId` (optional): which Sanity workspace should be queried. If not
  specified, it is set to `projectId=8yon6w8q`
- `mode` (optional): which Sanity dataset should be queried. If not specified,
  it is set to `mode=production`

[Example request to the proxy](https://sanity.sklinkusch.now.sh/?query=*[_type=='page'])
