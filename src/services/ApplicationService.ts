import { NumberUnitLength } from "luxon";
import { PoolService } from "./PoolService";

export interface Application {
    id: number;
    user_id: number;
    executor_id: number;
    category_id: number;
    region_id: number;
    status_id: number;
    comment: string;
    img: string;
    created_at: Date;
    updated_at: Date;
    rate: number;
    other_city: string;
    datetime_needed: string;
    package_size: string;
    work_volume: string;
    transport_type?: string;
    seat?: number;
    completed_at: Date;
    in_progress_ts: Date;
    rate_comment: string;
    late: boolean;
    decline_reason:string;
}

export class ApplicationService extends PoolService {

    async canCreateApplication(userId: number): Promise<boolean> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
        const query = 'SELECT COUNT(*) FROM applications WHERE user_id = $1 AND created_at > $2';
        const values = [userId, fiveMinutesAgo];
    
        try {
            const res = await this.pool.query(query, values);
            return parseInt(res.rows[0].count, 10) === 0;
        } catch (err) {
            console.error(err);
            return false; // Default to false in case of error
        }
    }

    async setDeclineReason(appid, reason) {
        await this.pool.query(`UPDATE applications SET decline_reason = $2 WHERE id = $1`)
    }

    async new({
        user_id,
        category_id,
        region_id,
        status_id,
        comment,
        img,
        other_city,
    }: {
        user_id: number;
        category_id: number;
        region_id: number;
        status_id: number;
        comment: string;
        img: string;
        other_city: string;
    }): Promise<Application> {
        if(await this.canCreateApplication(user_id)) {

            const {
                rows: [result],
            } = await this.pool.query(
                `
                INSERT INTO applications
                (user_id, category_id, region_id, status_id, comment, img, other_city)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `,
                [
                    user_id,
                    category_id,
                    region_id,
                    status_id,
                    comment,
                    img,
                    other_city,
                ]
            );
    
            return result;
        } else {
            console.log('an app already exists')
        }
    }



    async getAll(): Promise<Application[]> {
        const result = await this.pool.query(`
        SELECT * FROM applications
		ORDER BY id DESC
        `);
        return result.rows;
    }
    async getByStatusIdAndExecutorId(id, exec): Promise<Application[]> {
        const result = await this.pool.query(
            `
        SELECT * FROM applications
        WHERE status_id = $1 ${exec ? `AND executor_id = ${exec}` : ""}
		ORDER BY id DESC
        `,
            [id]
        );
        return result.rows;
    }

    async setExecutorId({ appId, userId }: { appId: number; userId: number }) {
        await this.pool.query(
            `UPDATE applications SET executor_id = $1 WHERE id = $2`,
            [userId, appId]
        );
    }
    async setNewDate({ appId, date }: { appId: number; date: string }) {
        await this.pool.query(
            `UPDATE applications SET datetime_needed = $1 WHERE id = $2`,
            [date, appId]
        );
    }

    async setLate({ appId}: { appId: number}) {
        await this.pool.query(
            `UPDATE applications SET late = true WHERE id = $1`,
            [appId]
        );
    }
    async setRate({ appId, rate }: { appId: number; rate: number }) {
        await this.pool.query(
            `UPDATE applications SET rate = $1 WHERE id = $2`,
            [rate, appId]
        );
    }
    async setRateNote({ appId, note }: { appId: number; note: string }) {
        await this.pool.query(
            `UPDATE applications SET rate_comment = $1 WHERE id = $2`,
            [note, appId]
        );
    }
    async setCompletedAt({ appId, date }: { appId: number; date: Date }) {
        await this.pool.query(
            `UPDATE applications SET completed_at = $1 WHERE id = $2`,
            [date, appId]
        );
    }

    async setInProgressTs({ appId, date }: { appId: number; date: Date }) {
        await this.pool.query(
            `UPDATE applications SET in_progress_ts = $1 WHERE id = $2`,
            [date, appId]
        );
    }

    async getById(id: number): Promise<Application> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM applications
            WHERE id = $1
		`,
            [id]
        );

        return result;
    }

    async getByUserId(id: number): Promise<Application[]> {
        const result = await this.pool.query(
            `
			SELECT * FROM applications
            WHERE user_id = $1
		`,
            [id]
        );

        return result.rows;
    }

    async getLastByUserId(id: number): Promise<Application> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
			SELECT * FROM applications
            WHERE user_id = $1 ORDER BY id DESC LIMIT 1     
		`,
            [id]
        );

        return result;
    }

    async getNoExec(): Promise<Application[]> {
        const result = await this.pool.query(
            `
			SELECT * FROM applications
            WHERE executor_id IS NULL
		`
        );

        return result.rows;
    }

    async getByExecutorId(id: number): Promise<Application[]> {
        const result = await this.pool.query(
            `
			SELECT * FROM applications
            WHERE executor_id = $1
		`,
            [id]
        );

        return result.rows;
    }

    async getByParentRegionId(id: number): Promise<Application[]> {
        const result = await this.pool.query(
            `
            WITH RECURSIVE region_hierarchy AS (
                SELECT id
                FROM regions 
                WHERE parent_region_id = $1
                UNION ALL
                SELECT r.id
                FROM regions r
                JOIN region_hierarchy rh ON r.parent_region_id = rh.id
            )
            SELECT a.*
            FROM applications a
            JOIN region_hierarchy rh ON a.region_id = rh.id
            ORDER BY a.id DESC
		`,
            [id]
        );

        return result.rows;
    }

    async getCountByUserId({ user_id }: { user_id: number }) {
        const result = await this.pool.query(
            `SELECT COUNT(*) FROM applications WHERE executor_id = $1`,
            [user_id]
        );
        return result.rows;
    }

    async getExecutedCountByUserId({ user_id }: { user_id: number }) {
        const result = await this.pool.query(
            `SELECT COUNT(*) FROM applications WHERE executor_id = $1 AND status_id = 4`,
            [user_id]
        );
        return result.rows;
    }

    async getAvgRateByUserId({ user_id }: { user_id: number }) {
        const result = await this.pool.query(
            `SELECT AVG(rate) 
        FROM applications 
        WHERE executor_id = $1 AND status_id = 4`,
            [user_id]
        );
        return result.rows
    }
    async updateStatus({ id, statusCode }: { id: number; statusCode: string }) {
        await this.pool.query(
            `
        UPDATE applications AS a 
        SET status_id = s.id
        FROM statuses AS s
        WHERE s.code = $2 AND a.id = $1
        `,
            [id, statusCode]
        );
    }

    async updateTransportData({
        id,
        data: {
            work_volume,
            datetime_needed,
            package_size,
            transport_type,
            seat,
        },
    }) {
        await this.pool.query(
            `
        UPDATE applications SET work_volume = $1, datetime_needed = $2, package_size = $3, transport_type = $4, seat = $5 WHERE id = $6
        `,
            [
                work_volume,
                datetime_needed,
                package_size,
                transport_type,
                seat,
                id,
            ]
        );
    }
}
