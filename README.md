## Speedybot CLI

```
npm init speedybot setup --project projectname --token tokenvalue

npx -y speedybot@^2.0.0 setup --project voiceflow -e BOT_TOKEN -e VOICEFLOW_TOKEN --install --boot

npx speedybot setup --project projectname --token tokenvalue

npm init speedybot webhook create -w https://www.myinfra.com -t tokenvalue -s secretvalue

npm init speedybot token
```

## Add commands

```
npx oclif generate command mycmd
npm run build
./bin/run.js mycmd
```
