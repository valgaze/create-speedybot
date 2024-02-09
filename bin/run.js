#!/usr/bin/env node
/* eslint-disable unicorn/prefer-number-properties */
;(async () => {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const [major] = process.versions.node.split('.').map(parseFloat)
  if (major < 18) {
    console.log(`
❌ ERROR!

Your Node version is ${major}, SpeedyBot's cli requires at least node v18+

You need to upgrade your node version, you can do that using any method you want.

Option 1: Download + install Node from the official site: https://nodejs.org/en/download

or

Option 2: Download Node LTS with using Volta in the terminal: https://docs.volta.sh/guide/

$ curl https://get.volta.sh | bash

$ volta install node


❌ ERROR! SpeedyBot will now exit

`)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }

  const oclif = await import('@oclif/core')
  await oclif.execute({development: false, dir: __dirname})
})()
