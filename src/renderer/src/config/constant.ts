export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_CONTEXTCOUNT = 5
export const DEFAULT_MAX_TOKENS = 4096
export const FONT_FAMILY =
  "Ubuntu, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"

export const platform = window.electron?.process?.platform
export const isMac = platform === 'darwin'
export const isWindows = platform === 'win32' || platform === 'win64'
export const isLinux = platform === 'linux'
