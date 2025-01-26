export function symptomCheckerPrompt(symptoms) {
    return [
      {
        role: "user",
        content: `
Role: Advanced AI Medical Diagnostician
Task: Analyze patient symptoms and provide initial assessment

Patient Symptoms: ${symptoms}

Instructions:
- Provide a clear, concise analysis
- Suggest possible causes
- Recommend immediate next steps
- Keep response under 100 words
- Be professional but approachable

Return ONLY the final assessment, no extras.`
      }
    ];
}

export function treatmentPlanPrompt(userDetails, symptoms) {
    return [
      {
        role: "user",
        content: `
Role: Medical Treatment Advisor
Task: Create personalized treatment plan

Patient Details: ${userDetails}
Reported Symptoms: ${symptoms}

Instructions:
- Design practical, actionable treatment steps
- Consider patient's specific context
- Include both immediate and long-term recommendations
- Keep response under 150 words
- Format clearly with bullet points

Return ONLY the treatment plan, no extras.`
      }
    ];
}

export function healthInsightsPrompt(healthData) {
    return [
      {
        role: "user",
        content: `
Role: Health Analytics Expert
Task: Analyze health data patterns and provide insights

Health Data: ${healthData}

Instructions:
- Identify key patterns or trends
- Flag any concerning indicators
- Suggest preventive measures
- Keep response under 100 words
- Use clear, actionable language

Return ONLY the analysis and recommendations, no extras.`
      }
    ];
}