import { SessionService } from '../services/SessionService'

export class Session {
	private options

	constructor(options = {}) {
		this.options = Object.assign({
			property: 'session',
			getSessionID: ctx => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
			store: {}
		}, options)
	}

	async getSession(id) {
		const sessionService = new SessionService()
		const session = await sessionService.get(id)

		const {
			state = {}
		} = session || {}

		return {
			...state
		}
	}

	clearSession(id) {
		const sessionService = new SessionService()
		return sessionService.delete(id)
	}

	async saveSession(id, state) {
		if (!state || Object.keys(state).length === 0) {
			return this.clearSession(id)
		}

		const sessionService = new SessionService()
		await sessionService.set(id, state)
	}

	middleware() {
		return async (ctx, next) => {
			const id = this.options.getSessionID(ctx)
			if (!id) {
				return next()
			}

			let session = await this.getSession(id)

			Object.defineProperty(ctx, this.options.property, {
				get: function () { return session },
				set: function (newValue) { session = Object.assign({}, newValue) }
			})

			return next().then(() => this.saveSession(id, session))
		}
	}
}
