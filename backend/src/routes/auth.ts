import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import { validateAuthentication, validateUserUpdateBody } from '../middlewares/validations'
import { issueCsrfToken } from '../middlewares/csrf'

const authRouter = Router()

authRouter.get('/csrf-token', issueCsrfToken)
authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, validateUserUpdateBody, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)
authRouter.post('/login', validateAuthentication, login)
authRouter.post('/token', refreshAccessToken)
authRouter.post('/logout', logout)
authRouter.post('/register', register)

export default authRouter
