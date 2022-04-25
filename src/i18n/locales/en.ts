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
    },
  },
  cli: {
    web: {
      description: 'Browser-based interfact',
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
      flags: {
        token: {
          description: "Your bot's access token",
        },
        webhookUrl: {
          description: 'Publically accessible url for your service',
        },
        forceDelete: {
          description:
            'If set, will not prompt to proceed and will auto delete ALL webhooks currently associated with a token',
        },
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
