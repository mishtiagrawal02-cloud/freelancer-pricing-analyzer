import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const prompt = process.argv.slice(2).join(" ");

async function run() {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",  // fast + free tier
    messages: [
      { role: "user", content: prompt }
    ],
  });

  console.log(response.choices[0].message.content);
}

run();
