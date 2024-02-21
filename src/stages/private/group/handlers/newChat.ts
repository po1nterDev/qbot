import { Context, Markup } from "telegraf"
import { Update } from "telegraf/typings/core/types/typegram"
import { SceneContext, SceneSessionData } from "telegraf/typings/scenes"

export const newChat = async (ctx: Context<Update.MyChatMemberUpdate> & Omit<SceneContext<SceneSessionData>, keyof Context<Update>>) => {
    //const update = ctx.update ? ctx.update : ctx
    //const message = update.message ? update.message : update.my_chat_member

    console.log(ctx.update.my_chat_member)
    //@ts-ignore
    const { id, type, title } = ctx.update.my_chat_member.chat

    const members = await ctx.telegram.getChatAdministrators(id)
    console.log(members)

    if (ctx.update.my_chat_member.new_chat_member.status == 'kicked') {
        return false
    }
    if (type == 'group' || type == 'supergroup') {
        await ctx.reply(`Бот добавлен в чат!`, {
            parse_mode: 'HTML'
        })
    }

    // await ctx.telegram.sendMessage(ctx.update.my_chat_member.from.id, `You added ${title}`)

    // await ctx.reply('hui')



    console.log(title)
}