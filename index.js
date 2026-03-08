require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});
// Helper: Pick Your Emoji

const GIVEAWAY_EMOJI = '✅';
const TOKEN = process.env.TOKEN;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Helper: check if member has Staff Or Admin
function hasPermissionRole(member) {
  return member.roles.cache.some(
    role => role.name === 'Staff' || role.name === 'Admin'
  );
}

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (!hasPermissionRole(message.member)) return; // Ignore users without roles

  const channelId = message.channel.id;

  // ===== START GIVEAWAY =====
  if (message.content === '!start') {
    const giveawayMessage = await message.channel.send(
      `🎁 **Giveaway Started!**\nReact with ${GIVEAWAY_EMOJI} to enter!`
    );
    await giveawayMessage.react(GIVEAWAY_EMOJI);
    return;
  }

  // ===== END GIVEAWAY / PICK WINNER =====
  if (message.content === '!end' || message.content === '!end') {
    const messages = await message.channel.messages.fetch({ limit: 50 });
    const giveawayMsg = messages.find(m => m.reactions.cache.has(GIVEAWAY_EMOJI));

    if (!giveawayMsg) return message.reply('❌ No giveaway found in this channel/thread.');

    const reaction = giveawayMsg.reactions.cache.get(GIVEAWAY_EMOJI);
    const users = await reaction.users.fetch();
    const entries = users.filter(u => !u.bot);

    if (entries.size === 0) return message.reply('❌ No participants.');

    const participants = Array.from(entries.values());
    const winner = participants[Math.floor(Math.random() * participants.length)];

    await message.channel.send(`✅ **Winner:** <@${winner.id}>`);
  }
});

client.login(TOKEN);
