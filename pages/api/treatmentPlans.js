import { treatmentPlanPrompt } from "../../lib/prompts";
import { queryO1 } from "../../lib/o1";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userDetails, symptoms } = req.body;
    try {
      const messages = treatmentPlanPrompt(userDetails, symptoms);
      const treatmentPlan = await queryO1(messages);
      return res.status(200).json({ treatmentPlan });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Failed to generate treatment plan. Please try again later." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}