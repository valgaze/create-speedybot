import {expect, test} from '@oclif/test'
import {argvParser} from '../src/util/common'
describe('Will extract --lang=val correctly', () => {
  const input = [
    '/Users/victoralgaze/.nvm/versions/node/v14.17.6/bin/node',
    '/Users/victoralgaze/Desktop/create-speedybot/bin/run',
    'webhook',
    '--lang=val',
  ]
  const expected = 'val'
  const actual = argvParser(input)
  test.it('', () => {
    expect(actual).to.contain(expected)
  })
})

export const m = [
  [
    '/Users/victoralgaze/.nvm/versions/node/v14.17.6/bin/node',
    '/Users/victoralgaze/Desktop/create-speedybot/bin/run',
    'webhook',
    '--lang=val',
  ],

  [
    '/Users/victoralgaze/.nvm/versions/node/v14.17.6/bin/node',
    '/Users/victoralgaze/Desktop/create-speedybot/bin/run',
    'webhook',
    '--lang',
    'val',
  ],

  [
    '/Users/victoralgaze/.nvm/versions/node/v14.17.6/bin/node',
    '/Users/victoralgaze/Desktop/create-speedybot/bin/run',
    'webhook',
    '-l=val',
  ],
  [
    '/Users/victoralgaze/.nvm/versions/node/v14.17.6/bin/node',
    '/Users/victoralgaze/Desktop/create-speedybot/bin/run',
    'webhook',
    '-l',
    'val',
  ],
]
