import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

// ===== Bot do Discord =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Função para pegar cotação do euro
async function getEuroRate() {
  try {
    const response = await axios.get(
      "https://economia.awesomeapi.com.br/json/last/EUR-BRL"
    );
    return parseFloat(response.data.EURBRL.bid);
  } catch (error) {
    console.error("Erro ao buscar cotação:", error);
    return null;
  }
}

// Evento: novo membro entrou
client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;
  const total = guild.memberCount - 1;

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

// ===== Mini servidor para o Render não hibernar =====
const app = express();
app.get("/", (req, res) => {
  res.send("Bot do Discord rodando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor web ativo na porta ${PORT}`);

  // Ping periódico a cada 2 minutos
  const url = "https://bot-discord-b7si.onrender.com";
  // const url = "http://localhost:" + PORT; // Alterar para a URL do seu app no Render
  setInterval(async () => {
    try {
      await axios.get(url);
      console.log("Ping enviado 🟢", new Date().toLocaleString());
    } catch (error) {
      console.error("Erro ao enviar ping:", error.message);
    }
  }, 2 * 60 * 1000); // 2 minutos
});
