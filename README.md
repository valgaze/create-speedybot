## Speedybot CLI

- Can run as `npm init speedybot@latest` or `npx -y speedybot`

- Add `--help` flag to end of commands (ex. `npx -y speedybot setup --help`)

## Setup

Download, scaffold, setup, and even boot SpeedyBot projects locally

```
npm init speedybot@latest setup -- --help
npx -y speedybot@latest setup --help
npx -y speedybot@latest setup
npx -y speedybot@^2.0.0 setup --project default --boot --install
npx -y speedybot@^2.0.0 setup --project voiceflow-kb -e BOT_TOKEN -e VOICEFLOW_API_KEY --install --boot
```

## Token

Inspect a WebEx token, see if its valid and see if any associated agents

```
npm init speedybot@latest token -- --help
npx -y speedybot@latest token --help
```

## Webhook

```
npm init speedybot@latest webhook -- --help
npx -y speedybot@latest webhook --help
npx -y speedybot@latest webhook list
npx -y speedybot@latest webhook create -w https://www.myinfra.com -t tokenvalue -s secretvalue

npx -y speedybot@latest webhook remove
```

## Add commands

```
npx oclif generate command mycmd
npm run build
./bin/run.js mycmd
```
