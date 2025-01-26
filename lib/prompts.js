// lib/prompts.js

export function systemPrompt() {
  return {
    role: "system",
    content: `You are GrokDoc, a friendly AI doctor. Keep responses brief and conversational. Under 100 words.`
  };
}

export function symptomCheckerPrompt(symptoms) {
  return [{
    role: "user",
    content: `${symptoms}`
  }];
}

export function treatmentPlanPrompt(userDetails, symptoms) {
  return [{
    role: "user",
    content: `Based on my symptoms (${symptoms}), what should I do? Keep it simple.`
  }];
}