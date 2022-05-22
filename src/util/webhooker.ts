import axios, {AxiosInstance, AxiosRequestConfig} from 'axios'

export interface WebhookConfig {
  name: string
  targetUrl: string
  resource?: string // 'all',
  event?: string // 'all',
  secret?: string
}

export interface Webhook {
  id: string
  name: string
  targetUrl: string
  resource: string
  event: string
  orgId: string
  createdBy: string
  appId: string
  ownedBy: string
  status: string
  created: Date
}

export class Webhooker {
  API = {
    createWebhook: 'https://webexapis.com/v1/webhooks',
    deleteWebhook: 'https://webexapis.com/v1/webhooks',
    getWebhooks: 'https://webexapis.com/v1/webhooks',
    getSelf: 'https://webexapis.com/v1/people/me',
  }

  private axiosInst: AxiosInstance
  constructor(private token: string) {
    this.axiosInst = axios.create({
      headers: {Authorization: `Bearer ${this.token}`},
    })
  }

  public async killAllWebhooks(hooks: Webhook[]): Promise<string[]> {
    const killChain: Promise<string>[] = []
    for (const item of hooks) {
      killChain.push(this.deleteWebhook(item.id))
    }

    return Promise.all(killChain)
  }

  public async deleteWebhook(id: string): Promise<string> {
    const url = `${this.API.deleteWebhook}/${id}`
    return this.axiosInst.delete(url)
  }

  public async killWebhooksByUrl(url: string): Promise<void> {
    const webhooks = await this.getWebhooks()
    const list = webhooks.data.items.filter(
      ({targetUrl}: {targetUrl: string}) => targetUrl === url,
    )
    this.killAllWebhooks(list)
  }

  async getWebhooks(): Promise<any> {
    return this.axiosInst.get(this.API.getWebhooks)
  }

  async getSelf(s: string): Promise<any> {}
  public async Setup(
    url: string,
    secret?: string,
  ): Promise<[{data: Webhook}, {data: Webhook}]> {
    // Get person info on bot, get its id
    return Promise.all([
      this.createFirehose(url, secret),
      this.createAttachmentActionsWebhook(url),
    ])
  }

  public async createFirehose(
    url: string,
    secret?: string,
  ): Promise<{data: Webhook}> {
    const payload: WebhookConfig = {
      resource: 'all',
      event: 'all',
      targetUrl: url,
      name: `${new Date().toISOString()}_firehose`,
    }

    if (secret) {
      payload.secret = secret
    }

    return this.createWebhook(payload)
  }

  public async createAttachmentActionsWebhook(
    url: string,
  ): Promise<{data: Webhook}> {
    const payload = {
      resource: 'attachmentActions',
      event: 'created',
      targetUrl: url,
      name: `${new Date().toISOString()}_attachmentActions`,
    }
    return this.createWebhook(payload)
  }

  public async createWebhook(payload: WebhookConfig): Promise<{data: Webhook}> {
    return this.axiosInst.post(this.API.createWebhook, payload)
  }
}
