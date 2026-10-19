import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { CSRF_SECRET } from '../config'
import ForbiddenError from '../errors/forbidden-error'

const COOKIE_NAME = '_csrf'
const HEX_PATTERN = /^[a-f0-9]{64}$/

const createToken = (seed: string): string =>
    createHmac('sha256', CSRF_SECRET).update(seed).digest('hex')

export const issueCsrfToken = (req: Request, res: Response) => {
    const existingSeed = req.cookies?.[COOKIE_NAME]

    const seed =
        typeof existingSeed === 'string' && HEX_PATTERN.test(existingSeed)
            ? existingSeed
            : randomBytes(32).toString('hex')

    res.cookie(COOKIE_NAME, seed, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 1000,
    })

    res.setHeader('Cache-Control', 'no-store')

    return res.json({
        csrfToken: createToken(seed),
    })
}

export const csrfProtection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next()
    }

    const seed = req.cookies?.[COOKIE_NAME]
    const token = req.get('X-CSRF-Token')

    if (
        typeof seed !== 'string' ||
        !HEX_PATTERN.test(seed) ||
        typeof token !== 'string' ||
        !HEX_PATTERN.test(token)
    ) {
        return next(new ForbiddenError('Отсутствует или неверен CSRF-токен'))
    }

    const expectedToken = createToken(seed)

    const isValid = timingSafeEqual(
        new Uint8Array(Buffer.from(token, 'hex')),
        new Uint8Array(Buffer.from(expectedToken, 'hex'))
    )

    if (!isValid) {
        return next(new ForbiddenError('Отсутствует или неверен CSRF-токен'))
    }

    return next()
}
