import { Client } from 'discord.js';
import { BinImage } from '../index';

const client = new Client();
const { fromSourceBin } = new BinImage();

client.on('message', async message => {
    const content = message.content;
    const match = content.match(/s((ource)|(rc))b\.in\/(\S+)/);
    if (!match) return;

    const [
        url, , , , binKey
    ] = match;

    console.log('Match found: ', url);
    console.log('   Sending image...');

    const react = '🖼️';
    const filter = (reaction, user) => reaction.emoji.name === react && !user.bot;

    await message.react(react).catch(console.error);

    const collector = message.createReactionCollector(filter, { max: 1, time: 10000 });
    collector.on('collect', async () => {
        if (message.deleted) return;
        await message.reactions.removeAll().catch(console.error);
        const buffer = await fromSourceBin({ url: binKey }).catch(console.error);
        await message.channel.send({ files: [ buffer ] }).catch(console.error);
    });
    collector.on('end', () => {
        if (message.deleted) return;
        message.reactions.removeAll().catch(console.error);
    });
});

client.login(process.env.TOKEN).catch(console.error);