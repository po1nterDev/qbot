import { UserService } from '../services/UserService'

type ContextScope = 'ADMIN' | 'USER'

export function scopeMiddleware(scope: ContextScope) {
	return async (ctx, next) => {
		let chatType = ''
		const context = ctx.update ? ctx.update : ctx

        const userService = new UserService()
        const user = await userService.get({ id: ctx.from.id })

		if (user.admin) {
            return
        }

		await next()
	}
}
