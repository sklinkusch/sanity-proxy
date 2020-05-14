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
  const modQueryString = queryString.replace("%5B", "[").replace("%5D", "]")
  const queryStart = modQueryString.indexOf("query")
  const queryEnd = modQueryString.indexOf("]")
  const queryProv = modQueryString.substr(queryStart, queryEnd - queryStart + 1)
  const intQueryString = modQueryString.substr(queryEnd + 1).replace("&&", "&")
  const newQueryVal = queryProv.substr(6)
  if (newQueryVal !== "") {
    params["query"] = newQueryVal
  }
  let newQueryString
  if (intQueryString.startsWith("&")) {
    newQueryString = intQueryString.substr(1)
  } else {
    newQueryString = intQueryString
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
