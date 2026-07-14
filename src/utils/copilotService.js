/**
 * Service to handle chat conversational edits to the resume using Gemini API.
 */

// Model schema matching the required return format (message + updated resume object)
const COPILOT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    message: { type: "STRING" },
    resume: {
      type: "OBJECT",
      properties: {
        personal: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            title: { type: "STRING" },
            email: { type: "STRING" },
            phone: { type: "STRING" },
            location: { type: "STRING" },
            website: { type: "STRING" },
            linkedin: { type: "STRING" },
            github: { type: "STRING" },
            summary: { type: "STRING" }
          },
          required: ["name", "title", "email", "summary"]
        },
        experience: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              company: { type: "STRING" },
              role: { type: "STRING" },
              startDate: { type: "STRING" },
              endDate: { type: "STRING" },
              location: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["company", "role", "startDate", "endDate", "description"]
          }
        },
        education: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              school: { type: "STRING" },
              degree: { type: "STRING" },
              date: { type: "STRING" },
              gpa: { type: "STRING" }
            },
            required: ["school", "degree", "date"]
          }
        },
        projects: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              tech: { type: "STRING" },
              link: { type: "STRING" },
              date: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["name", "tech", "description"]
          }
        },
        skills: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["personal", "experience", "education", "projects", "skills"]
    }
  },
  required: ["message", "resume"]
};

/**
 * Call Gemini to perform edits on the resume based on the chat history and active resume data
 */
export async function getCopilotResponse(apiKey, currentResume, chatHistory) {
  // Try to read from Vite's imported environment variables if no explicit key is supplied
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!key) {
    throw new Error("No Gemini API Key found. Provide it in the input field or configure VITE_GEMINI_API_KEY in the .env file.");
  }

  const systemInstruction = `
    You are "ResumeCraft Copilot", a world-class executive resume writer and ATS optimization expert.
    Your job is to help the candidate edit and build their resume iteratively via a chat.
    You have direct access to modify their resume state.

    The current state of their resume JSON is:
    ${JSON.stringify(currentResume, null, 2)}

    When the user requests changes (e.g. "Add a job", "Rewrite summary", "Add Python to skills"):
    1. Formulate a friendly, brief response explaining what changes you made.
    2. Directly modify the resume state. If they ask to add, append it. If they ask to rewrite, replace that specific section. If they ask to optimize a section, rewrite it using strong active verbs and quantified metrics (e.g., specific percentages, dollar values).
    3. Return the response strictly matching the schema layout (message + updated resume).
    4. Keep all other unrelated sections of the resume completely intact.
  `;

  // Format conversational messages for the api
  const formattedContents = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: COPILOT_RESPONSE_SCHEMA
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API error with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      throw new Error("Empty response returned from the Gemini AI Copilot.");
    }

    return JSON.parse(textContent);
  } catch (error) {
    console.error("Gemini Copilot API call failed:", error);
    throw error;
  }
}

/**
 * Handle simulated edits locally when API key is missing
 */
export function getSimulatedCopilotResponse(currentResume, userMessage) {
  const cleanMsg = userMessage.toLowerCase();
  let updatedResume = { ...currentResume };
  let responseText = "";

  if (cleanMsg.includes("summary") || cleanMsg.includes("profile")) {
    updatedResume.personal = {
      ...updatedResume.personal,
      summary: `Accomplished and results-oriented professional with 6+ years of expertise. Spearheaded multiple high-impact development initiatives, reducing server overhead costs by 30% and boosting daily active transaction throughput by 45%. Recognized for driving agile methodologies and writing clean, scalable JavaScript/TypeScript codebases.`
    };
    responseText = "Sure! I have updated your professional summary to make it sound more executive and highlight measurable impacts (30% cost reduction, 45% throughput boost). Check out the live A4 preview on the right!";
  } else if (cleanMsg.includes("skills") || cleanMsg.includes("skill") || cleanMsg.includes("add python")) {
    const newSkills = [...updatedResume.skills];
    if (!newSkills.includes("Python")) newSkills.push("Python");
    if (!newSkills.includes("Docker")) newSkills.push("Docker");
    updatedResume.skills = newSkills;
    responseText = "Done! I have added 'Python' and 'Docker' to your technical skills catalog list. They are now rendered on the preview sheet.";
  } else if (cleanMsg.includes("job") || cleanMsg.includes("experience") || cleanMsg.includes("add google")) {
    const newJob = {
      company: "Google LLC",
      role: "Senior Software Engineer",
      startDate: "Mar 2024",
      endDate: "Present",
      location: "Mountain View, CA",
      description: "Spearheaded search index optimization services, improving core search latency by 120ms.\nLed a cross-functional team of 8 engineers to ship automated caching protocols, reducing database CPU load spike frequencies by 25%."
    };
    updatedResume.experience = [newJob, ...updatedResume.experience];
    responseText = "Excellent! I have added a new Lead Software Engineer job entry at Google to the top of your experience list. The A4 page has re-partitioned itself to fit this entry.";
  } else if (cleanMsg.includes("project")) {
    const newProject = {
      name: "SaaS Multi-Tenant Billing Gateway",
      tech: "React, Stripe API, Node.js, Redis, AWS",
      date: "Nov 2024",
      description: "Architected a serverless billing gateway handling recursive subscription invoices. Configured state indicators reducing failed payment rates by 18%."
    };
    updatedResume.projects = [newProject, ...updatedResume.projects];
    responseText = "Completed! I've injected a new Stripe-integrated SaaS billing gateway project into your resume projects list.";
  } else {
    // General response
    responseText = "I've processed your instructions. To enable complete live custom edits, please supply a Google Gemini API Key at the top of the chat panel!";
  }

  return {
    message: responseText,
    resume: updatedResume
  };
}
