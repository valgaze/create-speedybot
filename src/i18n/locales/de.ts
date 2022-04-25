export default {
  globals: {
    flags: {
      lang: {
        description: `Einstellen der Sprache, ex: $[languages]`,
      },
    },
  },
  repos: {
    ['speedybot-starter']: {
      url: 'http://www.com',
      description: '🚀 speedybot-starter (standard)',
    },
    ['speedybot-superpowers']: {
      url: 'http://www.com',
      description:
        '🌟 speedybot-superpowers (gib deinem Bot $uperpowers wie z.B. *.xlsx-Verarbeitung)',
    },
  },
  cli: {
    webhook: {
      description:
        'Bereitgestellten Webhook erstellen, zerstören, lesen, ändern (insbesondere nützlich für serverlose/ephemere Datenverarbeitung)',
      flags: {
        token: {
          description: '{german} token blabh',
        },
        webhookUrl: {
          description: '{german} webhook url',
        },
        forceDelete: {
          description: '{german} description',
        },
      },
    },
    setup: {
      prompt:
        'Welches Verzeichnis? (Leer lassen, um Standardverzeichnis $[directory] zu verwenden',
    },
    token: {
      prompt: 'Was ist dein Bot-Token? (Hier erstellen: $[url])',
    },
  },
  prompts: {
    token: 'Was ist dein Bot-Token? (Hier erstellen: $[url])',
  },
  errors: {
    token: 'Token ungültig',
  },
}
