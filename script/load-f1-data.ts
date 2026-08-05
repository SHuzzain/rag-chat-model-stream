import Openai from "openai"
import "../envConfig"

const openAi = new Openai({
  apiKey: process.env.OPENAI_API_KEY,
})
