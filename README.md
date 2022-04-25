## Speedybot

CLI scaffolder for **[Speedybot](https://www.npmjs.com/package/speedybot)**

## What's Speedybot?

Speedybot is a tool to take you from zero to a user-valuable bot as quickly as possible w/ a buttery-smooth developer experience. Think of it as a "helper" library that extends the marvelous Node WebEx Bot Framework and makes it fast and easy for you to create sophisticated conversation agents. In short, Speedybot lets you focus on the stuff that actually matters-- content and powerful integrations.

## CLI Features

🌟 Quickly scaffold up various Speedybot projects-- **[$uperpowers](https://github.com/valgaze/speedybot-superpowers)**, **[serverless](https://github.com/valgaze/speedybot-serverless-experiment)**, etc

🌟 Create, list, destroy webhooks

🌟 Launch a web-ui, `npm init speedybot web`

## Add a language to CLI

1. Save a new translation file in **[src/i18n/locales/](./src/i18n/locales/en.ts)**

2. Add your file to the list in **[src/i18n/index.ts](./src/i18n/index.ts)**

# Usage

npm init speedybot --help

```sh

USAGE
  $ create-speedybot [COMMAND]

COMMANDS
  help     Display help for create-speedybot.
  setup    Quickly scaffold, configure, and boot an agent
  token    Test your token or see what data is associated with a particular token
  web      Browser-based interfact
  webhook  Create, destroy, read, modify deployed webhook (esp useful for serverless/ephemeral compute)

```

## Webhook

Lists webhooks

```
USAGE
  $ create-speedybot webhook list

FLAGS
  -t, --token  Set token
  -h, --help   Show CLI help.

DESCRIPTION
  List webhooks associated with provided token
```

Creates a webhook

```
USAGE
  $ create-speedybot webhook create

FLAGS
  -t, --token  Set token
  -w, --webhookUrl  Set url for webhook
  -h, --help   Show CLI help.

DESCRIPTION
  Creates a webhook at the specified URL for a specified token

```

Remove webhooks

```
USAGE
  $ create-speedybot webhook remove

FLAGS
  -t, --token  Set token
  -w, --webhookUrl  Set url for webhook
  -h, --help   Show CLI help.

DESCRIPTION
  List webhooks associated with provided token
```

## Token

Validate a token

```
USAGE
  $ create-speedybot token

FLAGS
  -t, --token  Set token
  -h, --help   Show CLI help.

DESCRIPTION
  Validate token
```

## Web

Launch web ui

```
USAGE
  $ create-speedybot web

FLAGS
  -t, --token  Set token
  -h, --help   Show CLI help.

DESCRIPTION
  Validate token
```

## Setup

Scaffold a **[speedybot](https://www.npmjs.com/package/speedybot)** project

```
USAGE
  $ create-speedybot setup

FLAGS
  -t, --token  Set token
  -r, --repo   Set project/repository
  -d, --directory Set Install directory
  -h, --help   Show CLI help.

DESCRIPTION
  Validate token
```
