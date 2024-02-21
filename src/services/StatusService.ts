import { PoolService } from "./PoolService";

export interface Status {
    id: number;
    label: string;
    code: string;
}

export class StatusService extends PoolService {
    async getAll(): Promise<Status[]> {
        const result = await this.pool.query(`SELECT * FROM statuses`);
        return result.rows;
    }

    async getById(id: number): Promise<Status> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM statuses
            WHERE id = $1
		`,
            [id]
        );

        return result;
    }

    async getByCode(code: string): Promise<Status> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM statuses
            WHERE code = $1
		`,
            [code]
        );

        return result;
    }
}
