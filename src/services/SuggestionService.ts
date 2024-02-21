import { PoolService } from "./PoolService";

export interface Suggestion {
    id: number;
    text: string;
    user_id: number;
    bug: boolean
}

export class SuggestionService extends PoolService {
    async new({
        text,
        user_id,
        bug
    }: {
        text: string;
        user_id: number;
        bug: boolean;
    }) {
        await this.pool.query(
            `INSERT INTO suggstions (text, user_id, bug) VALUES ($1,$2, $3)`,
            [text, user_id, bug]
        );
    }

    async getAll(): Promise<Suggestion[]> {
        const result = await this.pool.query(`
        SELECT * FROM suggestions
		ORDER BY id ASC
        `);
        return result.rows;
    }

    async getById(id: number): Promise<Suggestion> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM suggestions
            WHERE id = $1
		`,
            [id]
        );

        return result;
    }
}
