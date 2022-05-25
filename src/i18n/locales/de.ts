// en: US

export default {
  globals: {
    prompts: {
      token: '[German] What is your bot token? (Make one here: $[url])',
    },
    flags: {
      token: {
        description: '[German] What is your bot token? (Make one here: $[url])',
      },
      lang: {
        description: '[German] Set the language, ex $[languages]',
      },
      port: {
        description: '[German] Set the port you want to use, ex 8000',
      },
    },
    errors: {
      invalid_token: '[German] It appears the token you provided is invalid',
      not_bot:
        '[German] ATTENTION: this token does not appear associated with a bot',
    },
  },
  cli: {
    go: {
      description: '[german]]Entry point to the speedybot cli helper',
      menu: {
        description: '[german]]Welcome to speedybot, what do you want to do?',
        choices: [
          {
            name: '[german]]I want to start a speedybot project 🤖',
            value: 'setup',
          },
          {
            name: '[german]]Show me a web ui 📺',
            value: 'web',
          },
          {
            name: '[german]]Show me the help docs 🚑',
            value: 'showhelp',
          },
          {
            name: 'I want to start a tunnel (WARNING: uses ngrok) 📡',
            value: 'tunnel',
          },
          {
            name: 'Validate a token (and see associated bots) 🪙',
            value: 'token',
          },
          {
            name: 'Show me debug info on my system 🪲',
            value: 'debug',
          },
          {
            name: 'I want to create a webhook 🪝',
            value: 'webhook:create',
          },
          {
            name: 'I want to delete a webhook 🪝',
            value: 'webhook:remove',
          },
          {
            name: 'I want a list of all my webhooks 🪝',
            value: 'webhook:list',
          },
          {
            name: 'Tell me more about speedybot 🌟',
            value: 'tellmemore',
          },
        ],
      },
      choices: [
        {
          label: '[german]]I want to make a bot',
          destination: 'setup',
        },
        {
          label: 'I need to inspect/create webhooks',
          destination: 'webhook',
        },
      ],
    },
    web: {
      description: '[german]]Browser-based interfact',
      lingerMessage:
        '[german]]Opening site available below (press any key to exit)',
      flags: {
        port: {
          description: 'Set a port to serve web ui, defaults to 8001',
        },
        skip: {
          description:
            'Skip questions and just launch web ui (you can enter token + room later)',
        },
      },
    },
    webhook: {
      description:
        'Create, destroy, read, modify deployed webhook (esp useful for serverless/ephemeral compute)',
      warning:
        'Without specifying a webhook -w, this will destroy ALL webhooks associated with the token provided. Proceed?',
      deletesuccess: '[German] Your webhooks have been removed',
      deleteacknowledge:
        "Attempted to remove webhooks associated with '$[webhookUrl]'",
      nowebhooks:
        'No webhooks registered, see $ npm init speedybot webhook list',
      exiting: 'Ok, exiting...',
      currentWebhooks: '[German] Your current webhooks',
      flags: {
        token: {
          description: "Your bot's access token",
        },
        webhookUrl: {
          description: '[German] Publically accessible url for your service',
          prompt:
            '[German] What is your webhook url? (Must be accessible from public internet)',
        },
        forceDelete: {
          description:
            '[German]If set, will not prompt to proceed and will auto delete ALL webhooks currently associated with a token',
        },
        secret: {
          description:
            '[German] Secret value for webhooks, you must parse the response & compare values, see more here: https://developer.webex.com/blog/using-a-webhook-secret',
        },
      },
      success:
        'Complete-- see your registered webhooks by typing $ npm init speedybot webhook list',
      errors: {
        existingwebhook: 'This webhook already exists ($[url])',
      },
    },
    setup: {
      description: 'Quickly scaffold, configure, and boot an agent',
      flags: {
        repo: {
          description: 'Which speedybot repo to setup, defaults to starter',
          menu: 'Choose a starter template',
          error: 'Invalid repo (-r) choice "$[repo]"',
        },
        token: {
          description: "Your bot's access token",
        },
        directory: {
          description:
            'Desired directory to scaffold project (defaults to current dir)',
          followup:
            "What directory for your project? (leave blank defaults to '$[dir]')",
        },
      },
    },
    token: {
      description:
        'Test your token or see what data is associated with a particular token',
      errors: {
        invalid: 'It appears your token is invalid',
        not_bot: 'ATTENTION: this token does not appear associated with a bot',
      },
      prompt: 'What is your bot token? (Make one here: $[url])',
      success: 'Below is a summary of data associated with that token',
    },
  },
}
