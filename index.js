import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Pega cotação do euro
async function getEuroRate() {
  try {
    const response = await axios.get("https://economia.awesomeapi.com.br/json/last/EUR-BRL");
    return parseFloat(response.data.EURBRL.bid);
  } catch (error) {
    console.error("Erro ao buscar cotação:", error);
    return null;
  }
}

client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;
  const total = guild.memberCount-1;

  const euroRate = await getEuroRate();
  if (!euroRate) return;

  const calc = (30 / total) * euroRate;

  const channel = guild.channels.cache.get("1422674003931168948");
  if (channel) {
    channel.send(`👤 Nova pessoa entrou!  
Total de membros: **${total}**  
30 / ${total} × € atual = **R$ ${calc.toFixed(2)}**`);
  }
});

client.login(process.env.DISCORD_TOKEN);
