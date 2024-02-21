
import { UserService } from '../services/UserService'

export async function usersMiddleware(ctx, next) {
	try {
		const userService = new UserService()

		let chatType = ''

		if (ctx.message) {
			chatType = ctx.message.chat.type
		} else if (ctx.callback_query) {
			chatType = ctx.callback_query.message.chat.type
		}

		let result = false
		if (chatType === 'private') {
			const {
				id, first_name, last_name, username
			} = ctx.from

			result = await userService.set({ id, first_name, last_name, username, state: 'IN' })
		} else {
			if (!ctx.from || !ctx.from.first_name) {
				return
			}

			const {
				id, first_name, last_name, username
			} = ctx.from

			result = await userService.set({ id, first_name, last_name, username })
		}

		await next()
	} catch (err) {
		console.error(err)
	}
}

export async function clientVersionMiddleware(ctx,next) {
	try{
		console.log('hit')
		const userService = new UserService()
		const user = await userService.get({id: ctx.from.id}) 
		console.log(user)
		if(user.version < 3) {
			await userService.updateVersion(ctx.from.id, 3)
			await ctx.scene.enter('start')
		}
		await next()
	} catch(e) {
		console.log(e)
	}
}
