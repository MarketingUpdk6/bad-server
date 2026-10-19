import { unlink } from 'fs/promises'
import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

const expectedFormats: Record<string, string> = {
    'image/png': 'png',
    'image/jpg': 'jpeg',
    'image/jpeg': 'jpeg',
    'image/gif': 'gif',
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { file } = req

    if (!file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    try {
        try {
            const image = sharp(file.path, {
                limitInputPixels: 16_000_000,
                animated: true,
            })
            const metadata = await image.metadata()
            const expectedFormat = expectedFormats[file.mimetype]

            if (!expectedFormat || metadata.format !== expectedFormat) {
                throw new Error('Формат изображения не соответствует MIME-типу')
            }

            await image.raw().toBuffer()
        } catch {
            await unlink(file.path)

            return next(
                new BadRequestError(
                    'Некорректное изображение или превышен лимит 16 мегапикселей'
                )
            )
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${file.filename}`
            : `/${file.filename}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
