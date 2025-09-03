// Environment variable validation without Zod
function parseEnv() {
    const env = {}

    // NODE_ENV validation
    const validEnvs = ['development', 'test', 'production']
    env.NODE_ENV = validEnvs.includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'

    // PORT validation
    const portStr = process.env.PORT ?? '3000'
    const portNum = parseInt(portStr, 10)
    if (isNaN(portNum) || portNum <= 0) {
        throw new Error(`Invalid PORT: ${portStr}. Must be a positive integer.`)
    }
    env.PORT = portNum

    // ALLOWED_ORIGINS validation
    const originsStr = process.env.ALLOWED_ORIGINS ?? '*'
    env.ALLOWED_ORIGINS = originsStr === '*' ? ['*'] : originsStr.split(',').map(o => o.trim()).filter(Boolean)

    // Optional API keys
    env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    env.DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

    // Model configurations with defaults
    env.ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307'
    env.DEEPGRAM_MODEL = process.env.DEEPGRAM_MODEL || 'nova-3'

    // Boolean configurations with defaults
    env.DEEPGRAM_INTERIM_RESULTS = process.env.DEEPGRAM_INTERIM_RESULTS === 'false' ? false : true
    env.DEEPGRAM_SMART_FORMAT = process.env.DEEPGRAM_SMART_FORMAT === 'false' ? false : true
    env.DEEPGRAM_PUNCTUATE = process.env.DEEPGRAM_PUNCTUATE === 'false' ? false : true

    // String configurations with defaults
    env.DEEPGRAM_LANGUAGE = process.env.DEEPGRAM_LANGUAGE || 'en-US'
    env.DEEPGRAM_LANGUAGES = process.env.DEEPGRAM_LANGUAGES

    // Number configuration with default
    const endpointingStr = process.env.DEEPGRAM_ENDPOINTING
    const endpointingNum = endpointingStr ? parseInt(endpointingStr, 10) : 500
    if (isNaN(endpointingNum)) {
        throw new Error(`Invalid DEEPGRAM_ENDPOINTING: ${endpointingStr}. Must be a number.`)
    }
    env.DEEPGRAM_ENDPOINTING = endpointingNum

    return env
}

const env = parseEnv()

module.exports = { env }
