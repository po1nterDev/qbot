import { Markup, Scenes } from 'telegraf';
import { scopeMiddleware } from '../../../middleware/scope';
import { newChat } from './handlers/newChat';

export const groupStage = new Scenes.Stage<Scenes.SceneContext>([]);

groupStage.on(['my_chat_member'], async ctx => {
    newChat(ctx);
});

groupStage.on('message', async ctx => {
    //@ts-expect-error
    const messageText = ctx.message.text;
    let foundCategory = '';
    let foundSubcategory = '';
    let foundKeywords = '';
    let foundSla = '';

    // Check for keywords and assign the category and subcategory
    for (const { regex, category, subcategory, sla } of keywordCategories) {
        if (regex.test(messageText)) {
            foundCategory = category;
            foundSubcategory = subcategory;
            foundKeywords = messageText.match(regex).join(', ');
            foundSla = sla;
            break; // Stop checking after the first match
        }
    }

    if (foundCategory && foundSubcategory && foundKeywords) {
        const replyText = `Уважаемый (ая), в вашем сообщении содержатся ключевые слова: ${foundKeywords}. Мы предлагаем вам зарегистрировать свою заявку в направлении ${foundCategory}. ${foundCategory == 'НЕДВИЖИМОСТЬ' ? '' : `Тип заявки: ${foundSubcategory}.`} Далее выберите свой регион и создайте заявку. Она будет рассмотрена согласно SLA в срок ${foundSla}!`;
        const messageId = ctx.message.message_id;
        const inlineKeyboard = Markup.inlineKeyboard([
            Markup.button.url('Перейти в чат-бот', 'https://t.me/Lira_SF_bot')
        ]).reply_markup;
        await ctx.reply(replyText, { reply_to_message_id: messageId, reply_markup: inlineKeyboard });
    }
});


groupStage.command('check', scopeMiddleware("GROUPS"), async (ctx) => {
    console.log(123);
    await ctx.reply('Hello from group');
});

const keywordCategories = [
    {
        regex: /СЛОМАЛСЯ|РЕМОНТ/i,
        category: 'АДМ',
        subcategory: 'РЕМОНТ ПОМЕЩЕНИИ/ЗДАНИЙ',
        sla: '1-2 дня'
    },
    {
        regex: /РУЧКА|КАРАНДАШ|СТЕПЛЕР|БУМАГА/i,
        category: 'АДМ',
        subcategory: 'ВЫДАЧА КАНЦЕЛЯРСКИХ ТОВАРОВ',
        sla: '1-2 дня'
    },
    {
        regex: /МЕБЕЛЬ|СТОЛ|ТУМБОЧКА|КРЕСЛО|ДИВАН/i,
        category: 'АДМ',
        subcategory: 'ОРГАНИЗАЦИЯ РАБОЧЕГО МЕСТА И НА ОБСЛУЖИВАНИЯ ОФИСНОГО',
        sla: '1-2 дня'
    },
    {
        regex: /КОММАНДИРОВКА/i,
        category: 'АДМ',
        subcategory: 'ВОЗМЕЩЕНИЕ КОММАНДИРОВОЧНЫХ РАСХОДОВ',
        sla: '1-2 дня'
    },
    {
        regex: /ПРИНТЕР|СКАНЕР/i,
        category: 'АДМ',
        subcategory: 'КАРТРИДЖ',
        sla: '1-2 дня'
    },
    {
        regex: /БЫТОВЫЕ ТЕХНИКИ/i,
        category: 'АДМ',
        subcategory: 'КОМПЛЕКТУЮЩИЕ и РАСХОДНЫЕ МАТЕРИАЛЫ',
        sla: '1-2 дня'
    },
    {
        regex: /УЧАСТОК|ЗЕМЛЯ|ЗДАНИЯ/i,
        category: 'НЕДВИЖИМОСТЬ',
        subcategory: 'АРЕНДА ПОМЕЩЕНИИ',
        sla: '3-4 дня'
    },
    {
        regex: /УЧАСТОК|ЗЕМЛЯ|ЗДАНИЯ/i,
        category: 'НЕДВИЖИМОСТЬ',
        subcategory: 'ОФОРМЛЕНИЕ ПРАВА СОБСТВЕННОСТИ',
        sla: '3-4 дня'
    },
    {
        regex: /УЧАСТОК|ЗЕМЛЯ|ЗДАНИЯ/i,
        category: 'НЕДВИЖИМОСТЬ',
        subcategory: 'ОЦЕНКА ИМУЩЕСТВА',
        sla: '3-4 дня'
    },
    {
        regex: /ГОРИТ|ДЫМ|ТРЕЩИНА|ОГНЕТУЩИТЕЛЬ|ПЕСОК/i,
        category: 'СЛУЖБА ПОЖАРНОЙ БЕЗОПАСНОСТИ',
        subcategory: 'ОГНЕТУЩИТЕЛИ и ПОЖАРНОЕ ОБОРУДОВАНИЕ',
        sla: '2-3 дня'
    },
    {
        regex: /ДИЗЕЛЬ|БЕНЗИН/i,
        category: 'ТРАНСПОРТ',
        subcategory: 'ПОЛУЧЕНИЕ ГСМ (пополнение карты)',
        sla: '1-2 дня'
    },
    {
        regex: /ТРАКТОР|МАШИНА|ТЕХНИКА/i,
        category: 'ТРАНСПОРТ',
        subcategory: 'ОБЕСПЕЧЕНИЕ ТРАНСПОРТОМ',
        sla: '1-2 дня'
    }
];