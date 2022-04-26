// en: US

export default {
  globals: {
    prompts: {
      token: 'What is your bot token? (Make one here: $[url])',
    },
    flags: {
      token: {
        description: 'What is your bot token? (Make one here: $[url])',
      },
      lang: {
        description: `Set the language, ex $[languages]`,
      },
      port: {
        description: 'Set the port you want to use, ex 8000',
      },
    },
  },
  cli: {
    go: {
      description: 'Entry point to the speedybot cli helper',
      menu: {
        description: 'Welcome to speedybot, what do you want to do?',
        choices: [
          {
            name: 'I want to start a speedybot project 🤖',
            value: 'setup',
          },
          {
            name: 'Show me a web ui 📺',
            value: 'web',
          },
          {
            name: 'Show me the help docs 🚑',
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
          label: 'I want to make a bot',
          destination: 'setup',
        },
        {
          label: 'I need to inspect/create webhooks',
          destination: 'webhook',
        },
      ],
    },
    web: {
      description: 'Browser-based interfact',
      lingerMessage: 'Opening site available below (press any key to exit)',
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
      deletesuccess: 'Your webhooks have been removed',
      deleteacknowledge:
        "Attempted to remove webhooks associated with '$[webhookUrl]'",
      nowebhooks:
        'No webhooks registered, see $ npm init speedybot webhook list',
      exiting: 'Ok, exiting...',
      currentWebhooks: 'Your current webhooks',
      flags: {
        token: {
          description: "Your bot's access token",
        },
        webhookUrl: {
          description: 'Publically accessible url for your service',
          prompt:
            'What is your webhook url? (Must be accessible from public internet)',
        },
        forceDelete: {
          description:
            'If set, will not prompt to proceed and will auto delete ALL webhooks currently associated with a token',
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
