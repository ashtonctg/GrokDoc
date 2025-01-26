// pages/api/symptomChecker.js
import { symptomCheckerPrompt } from "../../lib/prompts";
import { queryO1 } from "../../lib/o1";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { symptoms } = req.body;
    console.log("Received symptoms:", symptoms);

    if (!symptoms) {
      return res.status(400).json({ error: "Symptoms are required" });
    }

    const messages = symptomCheckerPrompt(symptoms);
    console.log("Sending messages to O1:", messages);

    const diagnosis = await queryO1(messages);
    console.log("Diagnosis from O1:", diagnosis);

    return res.status(200).json({ diagnosis });
  } catch (error) {
    console.error("API Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Return a structured error so you can see it in the browser as well
    return res.status(500).json({
      error: "Failed to analyze symptoms",
      details: error.message,
    });
  }
}