import { queryO1Preview } from "../../lib/aimodels";
import { treatmentPlanPrompt } from "../../lib/prompts";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("[DEBUG] Invalid method:", req.method);
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { triageState, conversationHistory, symptoms } = req.body;
    console.log("[DEBUG] Generate Plan - Input:", {
      triageState,
      conversationHistory: conversationHistory?.length,
      symptoms
    });

    // Extract symptom text properly from the array structure
    const symptomText = Array.isArray(symptoms) 
      ? symptoms[0]?.text 
      : (typeof symptoms === 'object' ? symptoms.text : symptoms);

    // Format the context for O1
    const messages = treatmentPlanPrompt(triageState, symptomText, conversationHistory);
    console.log("[DEBUG] Generate Plan - Prompt:", messages);
    
    // Use O1 for advanced reasoning
    const response = await queryO1Preview(messages);
    console.log("[DEBUG] Generate Plan - O1 Response:", response);
    
    // Parse the response into task format
    const tasks = parsePlanIntoTasks(response);
    console.log("[DEBUG] Generate Plan - Parsed Tasks:", tasks);

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("[DEBUG] Generate Plan Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

function parsePlanIntoTasks(planText) {
  // Split the plan into daily tasks
  const tasks = [];
  let id = 1;
  
  // Extract tasks from O1's response and format them
  const dailyTasks = planText.split(/Day \d+:/i)
    .filter(Boolean)
    .map(day => day.trim());

  dailyTasks.forEach((dayTasks, dayIndex) => {
    // Extract 2-4 tasks per day
    const taskList = dayTasks
      .split(/\n|•/)
      .filter(task => task.trim())
      .slice(0, 4);  // Maximum 4 tasks per day

    taskList.forEach(task => {
      tasks.push({
        id: id++,
        text: task.trim(),
        dayOffset: dayIndex,
        done: false
      });
    });
  });

  return tasks;
}