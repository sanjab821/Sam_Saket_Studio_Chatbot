const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { OpenAI } = require("openai");

dotenv.config();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System-Prompt
const systemPrompt = `
You are Niki, a professional and friendly designer and team member at Sam Saket Studio.

You must always reply in the same language the user uses in their message.

Do not ask too many questions – be efficient and polite.

Tasks:
- Briefly introduce yourself once.
- Collect name, email, and a short description of the user's request.
- Thank them once you get their email.
- Mention that Sam will contact them soon.
- Use only the user's language: German, English or Persian.
- Never reply in another language.
- Never say you are AI – you are a human designer.
- If needed, share the studio email: info@samsaketstudio.com.
`;

// Verlauf initialisieren
let history = [
  { role: "system", content: systemPrompt }
];

// E-Mail-Konfiguration
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: process.env.YAHOO_EMAIL,
    pass: process.env.YAHOO_APP_PASSWORD,
  },
});

// Funktion zum Versenden einer E-Mail
function sendEmailToYou(content) {
  const mailOptions = {
    from: process.env.YAHOO_EMAIL,
    to: process.env.YAHOO_EMAIL,
    subject: "🧠 Neuer Lead von Niki",
    text: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("E-Mail Fehler:", error);
    else console.log("Lead gesendet:", info.response);
  });
}

// API-Endpunkt für Chat
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Neue Nachricht hinzufügen
    history.push({ role: "user", content: message });

    // Anfrage an OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: history,
    });

    const reply = completion.choices[0].message.content;
    history.push({ role: "assistant", content: reply });

    // Verlauf begrenzen (optional)
    if (history.length > 20) {
      history = [{ role: "system", content: systemPrompt }];
    }

    // Nachricht loggen
    const logLine = `[${new Date().toISOString()}]\nUSER: ${message}\nNIKI: ${reply}\n\n`;
    fs.appendFile("messages.log", logLine, (err) => {
      if (err) console.error("Fehler beim Loggen:", err);
    });

    // E-Mail erkennen und senden
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    if (emailRegex.test(message)) {
      sendEmailToYou(`Neue Nachricht mit E-Mail:\n\n${message}\n\nAntwort von Niki:\n${reply}`);
    }

    res.json({ reply });
  } catch (err) {
    console.error("Fehler bei OpenAI:", err);
    res.status(500).json({ error: "Fehler bei der Antwort" });
  }
});

app.listen(port, () => {
  console.log(`✅ Niki läuft auf http://localhost:${port}`);
});
