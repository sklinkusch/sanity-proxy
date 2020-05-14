require("isomorphic-fetch")
require("now-env")

const { parse } = require("url")
const { send } = require("micro")

module.exports = async (req, res) => {
  const { query } = parse(req.url)
  const params = parseQueryString(query)
  const { projectId = "8yon6w8q", mode = "production", ...remaining } = params
  const outputQuery = putTogetherString(remaining)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const requestUrl = `https://${projectId}.api.sanity.io/v1/data/query/${mode}?${outputQuery}`
  fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      send(res, 200, data)
    })
    .catch((error) => {
      send(res, 500, error)
    })
}

const parseQueryString = function (queryString) {
  const params = {}
  let queryProv
  queryProv = queryString.match(/query=\*\[.+\]/)
  const intQueryString = queryString
    .replace(queryProv[0], "")
    .replace("&&", "&")
  const newQueryVal = queryProv[0].substr(6)
  if (newQueryVal !== "") {
    params["query"] = newQueryVal
  }
  let newQueryString
  if (intQueryString.startsWith("&")) {
    newQueryString = intQueryString.substr(1)
  }
  if (newQueryString !== "" && newQueryString !== undefined) {
    const queries = newQueryString.split("&")
    for (let i = 0; i < queries.length; i++) {
      const temp = queries[i].split("=")
      if (temp[0] == "query") {
        const [queryKey, ...remainder] = temp
        params[queryKey] = remainder.join("=")
      } else {
        const [key, value] = temp
        params[key] = value
      }
    }
  }
  return params
}

const putTogetherString = function (queryObject) {
  const { query, ...otherVals } = queryObject
  let outputString = `query=${query}`
  for (let [key, value] of Object.entries(otherVals)) {
    outputString = `${outputString}&${key}=${value}`
  }
  return outputString
}
