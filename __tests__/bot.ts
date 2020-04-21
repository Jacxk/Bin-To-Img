import { Client } from "discord.js";
import { convert } from "../index";

const client = new Client()

client.on("message", async message => {
    const content = message.content;
    const match = content.match(/s((ource)|(rc))b\.in\/(\S+)/);
    if (!match) return;

    console.log("Match found: ", match[0])

    const react = "🖼️";
    const filter = (reaction, user) => reaction.emoji.name === react && !user.bot

    await message.react(react).catch(console.error);

    const collector = message.createReactionCollector(filter, { max: 1, time: 10000 });
    collector.on('collect', async () => {
        if (message.deleted) return;
        await message.reactions.removeAll().catch(console.error);
        const buffer = await convert(match[4]).catch(console.error);
        await message.channel.send({ files: [ buffer ] }).catch(console.error);
    });
    collector.on('end', () => {
        if (message.deleted) return;
        message.reactions.removeAll().catch(console.error)
    });
})

client.login(process.env.TOKEN).catch(console.error)