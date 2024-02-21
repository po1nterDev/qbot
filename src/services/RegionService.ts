import { PoolService } from "./PoolService";

export interface Region {
    id: number;
    title: string;
    parent_region_id: number;
}

export class RegionService extends PoolService {
    async new({
        title,
        parent_region_id,
    }: {
        title: string;
        parent_region_id: number;
    }) {
        await this.pool.query(
            `INSERT INTO regions (title, parent_region_id) VALUES ($1,$2)`,
            [title, parent_region_id]
        );
    }

    async getAll(): Promise<Region[]> {
        const result = await this.pool.query(`
        SELECT * FROM categories
		ORDER BY id ASC
        `);
        return result.rows;
    }

    async getAllParents(): Promise<Region[]> {
        const result = await this.pool.query(`
        SELECT * FROM regions WHERE parent_region_id IS NULL
		ORDER BY id ASC
        `);
        return result.rows;
    }

    async getAllChildren({ id }: { id: number }): Promise<Region[]> {
        const result = await this.pool.query(
            `
        SELECT * FROM regions WHERE parent_region_id = $1
		ORDER BY id ASC
        `,
            [id]
        );
        return result.rows;
    }

    async getById(id: number): Promise<Region> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM regions
            WHERE id = $1
		`,
            [id]
        );

        return result;
    }
}
