/**
 * Easy way to use await to halt for a given number of seconds
 */
export const wait = async (seconds: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(null), seconds * 1000)
  })
}
