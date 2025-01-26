// pages/api/treatmentPlans.js
import { queryO1Preview } from "../../lib/aimodels";
import { treatmentPlanPrompt } from "../../lib/prompts";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userDetails, symptoms } = req.body;
    const messages = treatmentPlanPrompt(userDetails || "", symptoms || "");
    const plan = await queryO1Preview(messages);
    return res.status(200).json({ plan });
  } catch (error) {
    console.error("TreatmentPlan Error:", error);
    return res.status(500).json({ error: error.message });
  }
}