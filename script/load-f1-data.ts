import Openai from "openai";

import { envConfig } from "../lib/env";

const openAi = new Openai({
  apiKey: envConfig.OPENAI_API_KEY,
});

void openAi;
