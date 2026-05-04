const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const axios = require('axios'); // <--- INI WAJIB ADA YU!

// --- CONFIG ---
const DISCORD_TOKEN = 'MTQ4NjgwMzI5MTUxNzIyNzIxOQ.Gi9p4l.hD8PmC-YwIsvj1zOe6oPFolwSOGfV4zHeQXFzM';
const GEMINI_API_KEY = 'AIzaSyAqHRlmWQsloUiNZJqdwmKBo-Z5viXDYtw';
const WELCOME_CHANNEL_ID = '1259582903747350630';
const AUTO_ROLE_ID = '1259575844570136627';
const AI_CHANNEL_ID = '1259575579229945918';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 1. FITUR WELCOME & AUTO ROLE
client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
        if (role) await member.roles.add(role);
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (welcomeChannel) {
            const embed = new EmbedBuilder()
                .setTitle(`Welcome to the Club! 🚀`)
                .setDescription(`Halo ${member}, selamat bergabung di server Wahyu Sniper!`)
                .setColor(0x50C878)
                .setThumbnail(member.user.displayAvatarURL());
            welcomeChannel.send({ embeds: [embed] });
        }
    } catch (e) { console.log("Welcome Error:", e.message); }
});

// 2. FITUR AI CHAT (BYPASS MODE)
client.on('messageCreate', async (message) => {
    // Biar bot nggak bales chat sendiri & cuma ngerespon di channel AI
    if (message.author.bot || message.channelId !== AI_CHANNEL_ID) return;

    try {
        await message.channel.sendTyping();
// --- UPDATE BAGIAN AXIOS ---
const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
        contents: [{ parts: [{ text: message.content }] }]
    }
);

        // Ambil balesan dari Gemini
        if (response.data.candidates && response.data.candidates[0].content) {
            const reply = response.data.candidates[0].content.parts[0].text;
            message.reply(reply.slice(0, 2000));
        } else {
            message.reply("Waduh, Gemini ngasih respon kosong Yu.");
        }

    } catch (err) {
        console.error("AI Error:", err.response ? err.response.data : err.message);
        message.reply("Waduh Yu, Gemini-nya lagi pusing. Coba tanya lagi bentar!");
    }
});

client.once('ready', () => {
    client.user.setActivity('XAU/USD Sniper', { type: ActivityType.Watching });
    console.log(`✅ ${client.user.tag} Gasken Pake Mode Bypass!`);
});

client.login(DISCORD_TOKEN);


// FITUR BIAR RAILWAY GAK ERROR (WEB SERVER SIMPLE)
const http = require('http');
http.createServer((req, res) => {
    res.write('Bot XYU is Online!');
    res.end();
}).listen(process.env.PORT || 3000);