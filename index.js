require("isomorphic-fetch")
require("now-env")

const { parse } = require("url")
const { send } = require("micro")

module.exports = async (req, res) => {
  const { query } = parse(req.url)
  console.log(`1: ${query}`)
  const params = parseQueryString(query)
  console.log(params)
  const { projectId = "8yon6w8q", mode = "production", ...remaining } = params
  const outputQuery = putTogetherString(remaining)
  console.log(`2: ${outputQuery}`)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  const requestUrl = `https://${projectId}.api.sanity.io/v1/data/query/${mode}?${outputQuery}`
  console.log(`3: ${requestUrl}`)
  fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      send(res, 200, data)
    })
    .catch((error) => {
      console.log(error)
      send(res, 500, error)
    })
}

const parseQueryString = function (queryString) {
  console.log(`A1: ${queryString}`)
  const params = {}
  const modQueryString = queryString.replace("%5B", "[").replace("%5D", "]")
  console.log(`A2: ${modQueryString}`)
  const queryStart = modQueryString.indexOf("query")
  console.log(`A3: ${queryStart}`)
  const queryEnd = modQueryString.indexOf("]")
  console.log(`A4: ${queryEnd}`)
  const queryProv = modQueryString.substr(queryStart, queryEnd - queryStart + 1)
  console.log(`A5: ${queryProv}`)
  const intQueryString = modQueryString.substr(queryEnd + 1).replace("&&", "&")
  console.log(`A6: ${intQueryString}`)
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
