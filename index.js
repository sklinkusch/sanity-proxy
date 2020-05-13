require("isomorphic-fetch")
require("now-env")

const { parse } = require("url")
const { send } = require("micro")

module.exports = async (req, res) => {
  const { query } = parse(req.url)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const requestUrl = `https://8yon6w8q.api.sanity.io/v1/data/query/production?${query}`
  fetch(requestUrl)
    .then((response) => response.json)
    .then((data) => {
      send(res, 200, data)
    })
    .catch((error) => {
      send(res, 500, error)
    })
}
