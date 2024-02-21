import { CategoryService } from "./CategoryService";
import { PoolService } from "./PoolService";
import { RegionService } from "./RegionService";

export type UserSubscription = "FREE" | "PRO";
export type UserState = "IN" | "NOT_IN" | "BAN";

export type Lang = "ru" | "kz";

export interface User {
    id: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    created_at: Date;
    last_seen_at: Date;
    modified: Date;
    state: UserState;
    admin: boolean;
    support: boolean;
    support_categories: number[];
    support_regions: number[];
    registered: boolean;
    fio: string;
    address: string;
    phone: string;
    email: string;
    department: string;
    other_city: string;
    supervisor: boolean;
    lang: Lang;
    version: number;
    region_id: number;
}

export class UserService extends PoolService {
    async get({ id }: { id: number }): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT
				*
			FROM users
			WHERE id = $1
		`,
            [id]
        );

        return result;
    }

    async updateVersion(id, ver) {
        await this.pool.query(`UPDATE users SET version = $1 WHERE id = $2`, [ver, id])
    }

    async updateLang({ id, lang }: { id: number; lang: Lang }): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			UPDATE users
			SET lang = $2
			WHERE id = $1
			RETURNING *

		`,
            [id, lang]
        );

        return result;
    }

    async getByUsername({ username }: { username: string }): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT
				*
			FROM users
			WHERE username = $1
		`,
            [username]
        );

        return result;
    }

    async getById({ id }: { id: number }): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT
				*
			FROM users
			WHERE id = $1
		`,
            [id]
        );

        return result;
    }

    async set({
        id,
        first_name,
        last_name,
        username,
        state,
    }: {
        id: number;
        first_name: string | null;
        last_name: string | null;
        username: string | null;
        state?: UserState | null;
    }): Promise<boolean> {
        const variables = [id, first_name, last_name, username];
        if (state) {
            variables.push(state);
        }

        const { rowCount } = await this.pool.query(
            `
			UPDATE users
			SET first_name = $2, last_name = $3, username = $4${state ? ", state = $5" : ""}
			WHERE id = $1
		`,
            variables
        );

        if (!rowCount) {
            await this.pool.query(
                `
				INSERT INTO users
				(id, first_name, last_name, username${state ? ", state" : ""})
				VALUES ($1, $2, $3, $4${state ? ", $5" : ""})
			`,
                variables
            );

            return true;
        }

        return false;
    }

    async getAdmin(): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(`
		SELECT
			*
		FROM users
		WHERE admin = true
	`);

        return result;
    }

    async getAllAdmin(): Promise<User[]> {
        const {
            rows
        } = await this.pool.query(`
		SELECT
			*
		FROM users
		WHERE admin = true
	`);

        return rows;
    }

    async getAllSupporters(): Promise<User[]> {
        const { rows } = await this.pool.query(`
			SELECT *
			FROM users 
            WHERE support = true
		`);
        return rows;
    }
    async getAll(): Promise<User[]> {
        const { rows } = await this.pool.query(`
			SELECT *
			FROM users 
            WHERE admin = false
		`);

        return rows;
    }

    async makeRegistered({ id }: { id: number }) {
        await this.pool.query(
            `UPDATE users SET registered = true WHERE id = $1`,
            [id]
        );
    }

    async makeSupport({ id }: { id: number }) {
        await this.pool.query(`UPDATE users SET support = true WHERE id = $1`, [
            id,
        ]);
    }

    async makeSupervisor({ id }: { id: number }) {
        await this.pool.query(
            `UPDATE users SET supervisor = true WHERE id = $1`,
            [id]
        );
    }

    async removeSupervisor({ id }: { id: number }) {
        await this.pool.query(
            `UPDATE users SET supervisor = false WHERE id = $1`,
            [id]
        );
    }

    async setPersonalData({
        id,
        fio,
        phone,
        email,
        address,
        department,
        region_id,
        other_city,
    }: {
        id: number;
        fio: string;
        phone: string;
        email: string;
        address: string;
        department: string;
        region_id: number;
        other_city: string;
    }) {
        await this.pool.query(
            `UPDATE users SET fio = $1, phone = $2, email = $3, address = $4, department = $5, region_id = $6, other_city = $8 WHERE id = $7`,
            [fio, phone, email, address, department, region_id, id, other_city]
        );
    }

    async getSupporterByCategoryIdAndRegionId({
        categoryId,
        regionId,
    }: {
        categoryId: number;
        regionId: number;
    }): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
        SELECT * FROM users WHERE support = true AND $1 = ANY(support_categories) AND $2 = ANY(support_regions)
        LIMIT 1
        `,
            [categoryId, regionId]
        );
        return result;
    }

    async getSupportersByCategoryIdAndRegionId({
        categoryId,
        regionId,
    }: {
        categoryId: number;
        regionId: number;
    }): Promise<User[]> {
        const { rows } = await this.pool.query(
            `
        SELECT * FROM users WHERE support = true AND $1 = ANY(support_categories) AND $2 = ANY(support_regions)
        `,
            [categoryId, regionId]
        );
        return rows;
    }

    async getSupportersByRegionId({
        regionId,
    }: {
        regionId: number;
    }): Promise<User[]> {
        const { rows } = await this.pool.query(
            `
        SELECT * FROM users WHERE support = true AND $1 = ANY(support_regions)
        `,
            [regionId]
        );
        return rows;
    }

    async setSupporterByCategoryIdAndRegionId({
        userId,
        categoryId,
        regionId,
    }: {
        userId: number;
        categoryId: number;
        regionId: number;
    }): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
            UPDATE users
            SET 
                support_categories = CASE 
                                        WHEN $1 = ANY(support_categories) THEN support_categories
                                        ELSE array_cat(support_categories, ARRAY[$1]::integer[])
                                     END,
                support_regions = CASE 
                                     WHEN $2 = ANY(support_regions) THEN support_regions
                                     ELSE array_cat(support_regions, ARRAY[$2]::integer[])
                                  END,
                support = true,
                modified = NOW()
            WHERE id = $3
            RETURNING *;            
            `,
            [categoryId, regionId, userId]
        );

        return result;
    }

    async removeSupporterRightsById(userId: number): Promise<User> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
          UPDATE users
          SET support = false, support_categories = NULL, support_regions = NULL, modified = NOW()
          WHERE id = $1
          RETURNING *
          `,
            [userId]
        );
        return result;
    }
}
