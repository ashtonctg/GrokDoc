// pages/api/treatmentPlans.js
import { treatmentPlanPrompt } from "../../lib/prompts";
import { queryO1 } from "../../lib/o1";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userDetails, symptoms } = req.body;
    // Provide defaults if needed
    const safeUserDetails = userDetails || "";
    const safeSymptoms = symptoms || "N/A";

    const messages = treatmentPlanPrompt(safeUserDetails, safeSymptoms);
    const treatmentPlan = await queryO1(messages);
    return res.status(200).json({ treatmentPlan });
  } catch (error) {
    console.error("Treatment Plan Error:", error);
    return res.status(500).json({
      error: "Failed to generate treatment plan. Please try again later.",
      details: error.message,
    });
  }
}