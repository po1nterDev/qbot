import { Markup, Telegraf } from 'telegraf';
import { NowRequest, NowResponse } from '@vercel/node';
import { Session } from './engine/session';
import * as dotenv from 'dotenv';
dotenv.config();

// stage setup
import { usersMiddleware, clientVersionMiddleware } from './middleware/users'; 
import { ApplicationService } from './services/ApplicationService';
import { group } from 'console';
import { groupStage } from './stages/private/group';

if (!process.env.TELEGRAM_APIKEY) {
    console.error('TELEGRAM_APIKEY is required to startup the bot');
    process.exit(-1);
} else {
    console.log(process.env.POSTGRES_URL);
}

// middleware setup
export const bot = new Telegraf(process.env.TELEGRAM_APIKEY, {
    telegram: {
        webhookReply: false,
    },
});
const session = new Session();

function useBot() {
    bot.catch((err, ctx) => console.error(err));
    bot.use(Telegraf.log());
    bot.use(session.middleware());
    bot.use(usersMiddleware);
    bot.use(groupStage);
    // bot.use(clientStage); 
    bot.action('/noop', async (ctx) => {
        try {
            await ctx.answerCbQuery(); 
        } catch (err) {
            console.error(err);
        }
    });
}

async function localBot() {
    useBot();
    await bot.launch();
    console.log('Local bot started!');
}

export async function useWebhook(req: NowRequest, res: NowResponse) {
    try {
        if (process.env.NODE_ENV !== 'development' && !process.env.VERCEL_URL) {
            throw new Error('VERCEL_URL is not set.');
        }

        const getWebhookInfo = await bot.telegram.getWebhookInfo();

        if (getWebhookInfo.url !== process.env.VERCEL_URL + '/api') {
            await bot.telegram.deleteWebhook();
            await bot.telegram.setWebhook(`${process.env.VERCEL_URL}/api`);
        }

        useBot();

        if (req.method === 'POST') {
            await bot.handleUpdate(req.body, res);

            if (res.writableEnded === false) {
                res.end();
            }
        } else {
            res.status(200).json('Listening to bot events...');
        }
    } catch (error) {
        console.error(error);
        return error.message;
    }
}

if (process.env.NODE_ENV === 'development') {
    localBot();
}

// bot.on('message', async (msg) => {
// console.log(msg)
// })