require("isomorphic-fetch")
require("now-env")

const { parse } = require("url")
const { send } = require("micro")

module.exports = async (req, res) => {
  const { query } = parse(req.url)
  console.log(`1: ${query}`)
  const params = await parseQueryString(query)
  console.log(params)
  const { projectId = "8yon6w8q", mode = "production", ...remaining } = params
  const outputQuery = await putTogetherString(remaining)
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

const parseQueryString = async function (queryString) {
  console.log(`A1: ${queryString}`)
  const params = {}
  const queryProv = await queryString.match(/query=\*\[.+\]/)
  console.log(queryProv)
  const intQueryString = await queryString[0]
    .replace(queryProv, "")
    .replace("&&", "&")
  console.log(`A3: ${intQueryString}`)
  const newQueryVal = await queryProv.substr(6)
  if (newQueryVal !== "") {
    params["query"] = newQueryVal
  }
  let newQueryString
  if (intQueryString.startsWith("&")) {
    newQueryString = await intQueryString.substr(1)
  } else {
    newQueryString = await intQueryString
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
  console.log(`B1: ${outputString}`)
  return outputString
}
