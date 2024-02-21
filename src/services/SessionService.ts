import { PoolService } from './PoolService'

interface Session {
	id: string
	state: object
	created_at: Date
	updated_at: Date
}

export class SessionService extends PoolService {
	async get(
		session: Session | number
	): Promise<Session> {
		const { rows: [result] } = await this.pool.query(`
			SELECT
				*
			FROM sessions
			WHERE id = $1
		`, [(session as Session).id || session])

		return result
	}

	async set(
		session: Session | number,
		state: object
	): Promise<void> {
		const { rowCount } = await this.pool.query(`
			UPDATE sessions
			SET state = $2, updated_at = now()
			WHERE id = $1
		`, [(session as Session).id || session, JSON.stringify(state)])

		if (!rowCount) {
			await this.pool.query(`
				INSERT INTO sessions
				(id, state)
				VALUES ($1, $2)
			`, [(session as Session).id || session, JSON.stringify(state)])
		}
	}

	async delete(
		session: Session | number
	): Promise<void> {
		await this.pool.query(`
			DELETE
			FROM sessions
			WHERE id = $1
		`, [(session as Session).id || session])
	}
}
