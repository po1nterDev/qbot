import { Pool, PoolClient } from 'pg'
import { pool } from '../engine/database'

export class PoolService {
	pool: Pool | PoolClient

	constructor(poolClient?: Pool | PoolClient) {
		this.pool = poolClient || pool
	}
}
