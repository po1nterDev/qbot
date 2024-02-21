import { UserService } from "../services/UserService";

type ContextScope = "GROUPS" | "PRIVATE";

export function scopeMiddleware(scope: ContextScope) {
    return async (ctx, next) => {
        let chatType = "";
        const context = ctx.update ? ctx.update : ctx;

        if (context.message) {
            chatType = context.message.chat.type;
        } else if (context.callback_query) {
            chatType = context.callback_query.message.chat.type;
        }

        if (chatType === "private" && scope === "GROUPS") {
            console.log('hit scope')
            console.log(context.message);
            return;
        }
        if (chatType !== "private" && scope === "PRIVATE") {
            return;
        }

        await next();
    };
}
