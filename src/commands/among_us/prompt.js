const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { ChatCommand } = require("../../utils/commands");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });


const colaDeTareas = [];


function fileToGenerativePart(buffer, mimeType) {
  return { inlineData: { data: buffer.toString("base64"), mimeType } };
}

function esVideo(attachment) {
  const tiposVideo = [
    "video/mp4",
    "video/avi",
    "video/quicktime",
    "video/mpeg",
    "video/mov",
  ];
  return tiposVideo.includes(attachment.contentType);
}


function obtenerDuracionVideo(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duracion = metadata.format.duration;
        resolve(duracion);
      }
    });
  });
}


function extraerFotogramas(videoPath) {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, "tempFrames");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const fotogramas = [];
    ffmpeg(videoPath)
      .on("end", () => {
        fs.readdir(tempDir, (err, files) => {
          if (err) {
            reject(err);
            return;
          }

          files.forEach((file) => {
            const filePath = path.join(tempDir, file);
            const buffer = fs.readFileSync(filePath);
            const base64 = buffer.toString("base64");
            fotogramas.push({ buffer: base64, mimeType: "image/jpeg" });
            fs.unlinkSync(filePath);
          });

          fs.rmdirSync(tempDir, { recursive: true });
          resolve(fotogramas);
        });
      })
      .on("error", (err) => {
        fs.rmdirSync(tempDir, { recursive: true });
        reject(err);
      })
      .output(path.join(tempDir, "frame-%03d.jpg"))
      .outputOptions(["-vf fps=1"])
      .run();
  });
}

// Función para descargar el video y luego eliminarlo después de procesar
async function descargarVideo(url) {
  const videoPath = path.join(__dirname, "tempVideo.mp4");
  const writer = fs.createWriteStream(videoPath);

  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", async () => {
      try {
        const duracion = await obtenerDuracionVideo(videoPath);
        if (duracion >= 16) {
          reject(new Error("El video es demasiado largo"));
        } else {
          const fotogramas = await extraerFotogramas(videoPath);
          resolve(fotogramas);
        }
      } catch (error) {
        reject(error);
      } finally {
        fs.unlinkSync(videoPath);
      }
    });
    writer.on("error", reject);
  });
}


function añadirATareaCola(tarea) {
  colaDeTareas.push(tarea);
  if (colaDeTareas.length === 1) {
    procesarCola();
  }
}


async function procesarCola() {
  while (colaDeTareas.length > 0) {
    const tareaActual = colaDeTareas[0];
    try {
      await procesarTarea(tareaActual);
    } catch (error) {
      console.error("Error al procesar la tarea: ", error);
      
      tareaActual.interaction.editReply({
        content: "Hubo un error al procesar tu solicitud.",
        ephemeral: true,
      });
    }
    colaDeTareas.shift(); 
  }
}


async function procesarTarea({ interaction, promptText, attachment }) {
  let parts;
  if (esVideo(attachment)) {
    const fotogramas = await descargarVideo(attachment.url);
    parts = [
      promptText,
      ...fotogramas.map((f) => fileToGenerativePart(f.buffer, f.mimeType)),
    ];
  } else {
    const response = await axios.get(attachment.url, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data, "binary");
    const imagePart = fileToGenerativePart(imageBuffer, attachment.contentType);
    parts = [promptText, imagePart];
  }

  const safetyConfig = {
    blockSettings: {
      harassment: "BLOCK_NONE",
      hateSpeech: "BLOCK_NONE",
      sexualContent: "BLOCK_NONE",
      dangerousContent: "BLOCK_NONE",
    },
  };

  const result = await model.generateContent(parts, safetyConfig);
  const responseAI = await result.response;
  const text = responseAI.text();

  const embed = new EmbedBuilder()
    .setTitle("Respuesta de la IA")
    .setDescription(text)
    .setColor("Random")
    .setTimestamp()
    .setFooter({
      text: "Sistema de IA ",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL(),
    });

  await interaction.editReply({ embeds: [embed] });
}

// Comando de chat
module.exports = ChatCommand({
  name: "prompt",
  description: "Genera texto a partir de una imagen o un video y un prompt",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "texto",
      description: "Texto para acompañar la imagen o el video.",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "archivo",
      description: "Adjunta una imagen o un video de hasta 15 segundos.",
      required: true,
    },
  ],
  async execute(client, interaction) {


    const allowedChannelId = "1185823316682997790";

    // Verificar si el comando se está ejecutando en el canal correcto
    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: "Este comando solo se puede usar en el canal <#1185823316682997790>.",
        ephemeral: true
      });
    }


    await interaction.deferReply();

    
    const promptText = interaction.options.getString("texto");
    const attachment = interaction.options.getAttachment("archivo");

    // Añadir la tarea a la cola
    añadirATareaCola({ interaction, promptText, attachment });
  },
});
