import { PoolService } from "./PoolService";

export interface Category {
    id: number;
    title: string;
    parent_category_id: number;
    is_active: boolean;
    title_kz: string;
}

export class CategoryService extends PoolService {
    async new({
        title,
        parent_category_id,
    }: {
        title: string;
        parent_category_id: number;
    }): Promise<Category> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			INSERT INTO categories
			(title, parent_category_id)
			VALUES ($1, $2)
			RETURNING *
		`,
            [title, parent_category_id]
        );

        return result;
    }

    async getAll(): Promise<Category[]> {
        const result = await this.pool.query(`
        SELECT * FROM categories
		ORDER BY id ASC
        `);
        return result.rows;
    }

    async getAllParents(): Promise<Category[]> {
        const result = await this.pool.query(`
        SELECT * FROM categories WHERE parent_category_id IS NULL
		ORDER BY id ASC
        `);
        return result.rows;
    }

    async getAllChildren({ id }: { id: number }): Promise<Category[]> {
        const result = await this.pool.query(
            `
        SELECT * FROM categories WHERE parent_category_id = $1
		ORDER BY id ASC
        `,
            [id]
        );
        return result.rows;
    }

    async getIdByTitle(title: string): Promise<number> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT id FROM categories
            WHERE title = $1
		`,
            [title]
        );

        return parseInt(result.id);
    }

    async getById(id: number): Promise<Category> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM categories
            WHERE id = $1
		`,
            [id]
        );

        return result;
    }

    async getOnlyActive(): Promise<[Category]> {
        const result = await this.pool.query(
            `
			SELECT * FROM categories
            WHERE is_active = true
		`
        );

        return result.rows;
    }

    async deactivate({ id }: { id: number }) {
        await this.pool.query(
            `
        UPDATE categories SET is_active = false WHERE id = $1
        `,
            [id]
        );
    }

    async activate({ id }: { id: number }) {
        await this.pool.query(
            `
        UPDATE categories SET is_active = true WHERE id = $1
        `,
            [id]
        );
    }

    async updateTitle({ id, title }: { id: number; title: string }) {
        await this.pool.query(
            `
        UPDATE categories SET title = $2 WHERE id = $1
        `,
            [id, title]
        );
    }

    async bump({ id }: { id: number }): Promise<void> {
        await this.pool.query(
            `
			UPDATE categories
			SET updated_at = now()
			WHERE id = $1
		`,
            [id]
        );
    }
}
