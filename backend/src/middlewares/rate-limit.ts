import { rateLimit } from 'express-rate-limit'

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Слишком много запросов. Повторите попытку позже',
    },
})

export default apiLimiter
