import axios from 'axios'

export interface APIFlags {
  engine?: string // The engine model id-- there 4 models, ada, babbage, curie, davinci)
  prompt?: string // One or more prompts to generate from. Can be a string, list of strings, a list of integers (i.e. a single prompt encoded as tokens), or list of lists of integers (i.e. many prompts encoded as integers).
  max_tokens?: number // How many tokens to complete to. Can return fewer if a stop sequence is hit.
  temperature?: number // What sampling temperature to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer. We generally recommend using this or top_p but not both.
  top_p?: number // An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend using this or temperature but not both.
  n?: number // How many choices to create for each prompt.
  stream?: boolean // Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events as they become available, with the stream terminated by a data: [DONE] message.
  logprobs?: number // Include the log probabilities on the logprobs most likely tokens. So for example, if logprobs is 10, the API will return a list of the 10 most likely tokens. If logprobs is supplied, the API will always return the logprob of the sampled token, so there may be up to logprobs+1 elements in the response.
  stop?: string // One or more sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence.
  [key: string]: any
}

export interface APIConfig {
  full_response?: boolean // Defaults to false, if set to true .ask() will return full response w/ metadata
  endpoint?: string // Defaults to 'https://api.openai.com/v1/engines/davinci/completions' (can change engine in APIConfig)
}

export class Translator {
  private APIConfig: APIConfig = {
    endpoint: 'https://api.openai.com/v1/engines/davinci/completions',
    full_response: false,
  }

  private APIFlags = {
    max_tokens: 1080,
    temperature: 0.7,
    stop: '\n',
  }

  constructor(public token: string) {}
  public setAPIConfig(config: APIConfig) {
    this.APIConfig = config
  }

  public buildQuery(json: any, fromLang: string, toLang: string): string {
    // todo wire up: https://github.com/valgaze/gpt3rocket/blob/master/src/index.ts
    const message = `Translate the JSON obect below from ${fromLang} to ${toLang}. Don't translate the keys and please return valid JSON. 
INPUT JSON:
${JSON.stringify(json, null, 2)}


Write the output JSON here in ${toLang} 
OUTPUT JSON:`
    return message
  }

  public async translate(prompt: string): Promise<any> {
    const {endpoint, full_response} = this.APIConfig
    const result = await axios
      .post(
        endpoint as string,
        {
          prompt,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        },
      )
      .catch((e) => {
        if (e.response && e.response.status === 401 && e.response.data) {
          console.log(`\n\n<YOUR CREDENTIAL IS LIKELY INVALID>\n\n`)
        }
      })

    return result
  }
}
