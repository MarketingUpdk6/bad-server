import { ErrorRequestHandler } from 'express'
import { MulterError } from 'multer'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof MulterError) {
        const isFileTooLarge = err.code === 'LIMIT_FILE_SIZE'

        res.status(isFileTooLarge ? 413 : 400).send({
            message: isFileTooLarge
                ? 'Размер файла не должен превышать 5 МБ'
                : 'Некорректный запрос загрузки файла',
        })
        return
    }
    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message
    console.log(err)

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler
