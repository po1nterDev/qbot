import pg, { Pool } from 'pg'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

export const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
	max: 300
})

pool.on('error', (err) => {
	console.error('Unexpected error on idle client', err)
	process.exit(-1)
})

export async function tx(callback: (pool: Pool) => {}) {
	const client = await pool.connect()
	await client.query('BEGIN')
	// console.log('BEGIN')

	let result

	try {
		// console.log('WAITING...')
		result = await callback(client)
		await client.query('COMMIT')
		// console.log('COMMIT')
	} catch (e) {
		await client.query('ROLLBACK')
		// console.log('ROLLBACK', e.message)

		throw e
	} finally {
		// console.log('RELEASE')
		client.release()
	}

	return result
}
