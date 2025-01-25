import { symptomCheckerPrompt } from "../../lib/prompts";
import { queryO1 } from "../../lib/o1";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { symptoms } = req.body;
    try {
      const messages = symptomCheckerPrompt(symptoms);
      const diagnosis = await queryO1(messages);
      return res.status(200).json({ diagnosis });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to analyze symptoms. Please try again later." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}