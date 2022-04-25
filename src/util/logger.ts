import color from '@oclif/color'

export const pickRandom = (list: any[]) =>
  list[Math.floor(Math.random() * list.length)]

export function log(...payload: any[]) {
  console.log.apply(console, payload as [any?, ...any[]])
}

export function warning(...payload: any[]) {
  log(color.yellow(...payload))
}

export function bad(...payload: any[]) {
  log(color.red(`\n\n# ---------------- 🚨 🚨 🚨 ------------------- #\n\n`))
  log(color.red(...payload))
  log(color.red(`\n\n# ---------------- 🚨 🚨 🚨 ------------------- #\n\n`))
}

export function good(...payload: any[]) {
  log(color.green(...payload))
}

export const ascii_art = (colorChoice?: string) => {
  let colorFallback = colorChoice
  if (!colorFallback) {
    const opts = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
    colorFallback = pickRandom(opts)
  }
  type Augment = {
    red: (_: string) => void
    green: (_: string) => void
    yellow: (_: string) => void
    blue: (_: string) => void
    magenta: (_: string) => void
    cyan: (_: string) => void
    white: (_: string) => void
  }
  const pickColor: Augment = color
  const colorize = pickColor[colorFallback as keyof Augment]
  log(
    colorize(`
  ███████╗██████╗ ███████╗███████╗██████╗ ██╗   ██╗██████╗  ██████╗ ████████╗
  ██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗██╔═══██╗╚══██╔══╝
  ███████╗██████╔╝█████╗  █████╗  ██║  ██║ ╚████╔╝ ██████╔╝██║   ██║   ██║   
  ╚════██║██╔═══╝ ██╔══╝  ██╔══╝  ██║  ██║  ╚██╔╝  ██╔══██╗██║   ██║   ██║   
  ███████║██║     ███████╗███████╗██████╔╝   ██║   ██████╔╝╚██████╔╝   ██║   
  ╚══════╝╚═╝     ╚══════╝╚══════╝╚═════╝    ╚═╝   ╚═════╝  ╚═════╝    ╚═╝   
  `),
  )
}

export const startFlash = (speed: number = 25) => {
  const intervalRef = setInterval(() => {
    ascii_art()
  }, speed)

  return {
    intervalRef: intervalRef,
    stop: () => clearInterval(intervalRef),
  }
}
