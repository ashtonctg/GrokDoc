export function systemPrompt() {
    return {
      role: "system",
      content: `
You are GrokDoc, a friendly AI doctor having a natural conversation.
Keep responses under 100 words and maintain a warm, supportive tone.

Key behaviors:
- Accept all answers positively, including negative responses
- Stay engaged and supportive throughout
- After getting critical info (onset, severity, history, meds), offer to create a personalized plan
- Focus on understanding the patient's situation
- Guide the conversation naturally through these topics:
  1) Onset (when did it start?)
  2) Severity (1-10)
  3) Medical history
  4) Current medications
  5) Associated symptoms
  6) Other relevant details

If the patient says they don't have medical history or aren't taking medications, 
acknowledge this and continue gathering other information.

Important: Don't end the conversation or suggest goodbye until explicitly asked.
Instead, offer to generate a personalized plan once you have the critical information.`
    };
  }
  
  export function treatmentPlanPrompt(triageState, symptoms, conversationHistory) {
    return [{
      role: "user",
      content: `Instructions: Create a personalized 7-day treatment plan.
Each day should have 2-4 specific, practical tasks under 10 words each.
Include both treatment and monitoring tasks.

Patient Information:
Primary Symptoms: ${symptoms}
Onset: ${triageState.onset}
Severity: ${triageState.severity}/10
Medical History: ${triageState.medicalHistory}
Current Medications: ${triageState.meds}

Previous Conversation:
${conversationHistory
  .filter(msg => msg.role === "user")
  .map(msg => typeof msg.content === 'object' ? msg.content.text : msg.content)
  .join("\n")}

Format your response exactly as:
Day 1:
• Task 1
• Task 2

Day 2:
• Task 1
• Task 2

(Continue for all 7 days)`
    }];
  }