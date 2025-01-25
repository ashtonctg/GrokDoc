export function symptomCheckerPrompt(symptoms) {
    return [
      {
        role: "system",
        content:
          "You are an advanced AI doctor specialized in analyzing user symptoms and providing possible diagnoses. Be concise but thorough.",
      },
      {
        role: "user",
        content: `I am experiencing these symptoms: ${symptoms}. What could be causing them, and what should I do next?`,
      },
    ];
  }
  
  export function treatmentPlanPrompt(userDetails, symptoms) {
    return [
      {
        role: "system",
        content:
          "You are a medical advisor AI specializing in creating personalized treatment plans based on user data and symptoms.",
      },
      {
        role: "user",
        content: `User details: ${userDetails}\nSymptoms: ${symptoms}\nPlease craft a detailed plan that addresses these.`,
      },
    ];
  }
  
  export function healthInsightsPrompt(healthData) {
    return [
      {
        role: "system",
        content:
          "You are a health analytics AI that identifies patterns in user data and provides actionable insights or warnings.",
      },
      {
        role: "user",
        content: `Here is my recent health data: ${healthData}. Please provide any insights or cautions.`,
      },
    ];
  }