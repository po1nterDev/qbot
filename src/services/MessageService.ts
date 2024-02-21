import { PoolService } from './PoolService';

export interface Message {
    id: number;
    from: number;
    to: number;
    application_id: number;
    text: string;
}

export class MessageService extends PoolService {
    async new({
        from,
        to,
        application_id,
        text,
    }: {
        from: number;
        to: number;
        application_id: number;
        text: string;
    }): Promise<Message> {
        const {
            rows: [result],
        } = await this.pool.query(
            `
            INSERT INTO messages 
            (from_user_id, to_user_id, application_id, text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
            [from, to, application_id, text]
        );
        return result;
    }
}
