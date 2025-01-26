import { healthInsightsPrompt } from "../../lib/prompts";
import { queryO1 } from "../../lib/aimodels";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { healthData } = req.body;
    try {
      const messages = healthInsightsPrompt(healthData);
      const insights = await queryO1(messages);
      return res.status(200).json({ insights });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to generate health insights. Please try again later." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}