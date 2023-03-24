import Fastify from 'fastify'
import heliaPlugin from './plugins/helia.js'
import * as dotenv from 'dotenv'


dotenv.config()

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
}

const fastify = Fastify({
  // @ts-ignore
  logger: envToLogger[process.env.NODE_ENV ?? 'production'] ?? true,
})
fastify.register(heliaPlugin)




try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
  return this.toString()
}
