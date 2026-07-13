/**
 * Service to handle granular step-by-step resume creation (detailed intake chatbot).
 */

const INTAKE_RESPONSE_SCHEMA = {
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
 * Call Gemini to execute granular interview questions and edit the resume state live
 */
export async function getIntakeResponse(apiKey, currentResume, chatHistory) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;

  if (!key) {
    throw new Error("No Gemini API Key found. Configure VITE_GEMINI_API_KEY in the .env file.");
  }

  const systemInstruction = `
    You are "ResumeCraft Creator", an interactive conversational interviewer that helps candidates build their resume from scratch.
    Your goal is to collect their professional details by asking for exactly ONE single parameter at a time.

    The current state of their resume JSON is:
    ${JSON.stringify(currentResume, null, 2)}

    Your workflow MUST be highly structured:
    1. Check what fields are missing in the current resume.
    2. Ask the user for exactly one parameter in this order:
       - Full Name (if empty)
       - Professional Title (if empty)
       - Email Address (if empty)
       - Phone Number (if empty)
       - Location (if empty)
       - Professional Summary (if empty)
       - Skills (if empty)
       - Work Experience (Ask: "Would you like to add a work experience?" -> Company -> Role -> Dates -> Location -> Description)
       - Education (Ask: "Would you like to add education?" -> School -> Degree -> Dates)
       - Projects (Ask: "Would you like to add a project?" -> Name -> Tech -> Description)
    3. In each response:
       - Confirm the single field you just updated in the resume.
       - Ask the user for the NEXT single parameter. DO NOT ask multiple questions.
       - Return the response strictly matching the schema layout (message + updated resume).
  `;

  // Format conversational messages for the api
  const formattedContents = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

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
          responseSchema: INTAKE_RESPONSE_SCHEMA
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
      throw new Error("Empty response returned from the Gemini AI Creator.");
    }

    return JSON.parse(textContent);
  } catch (error) {
    console.error("Gemini Creator API call failed:", error);
    throw error;
  }
}

// Temporary storage for multi-part entries during simulation
let tempJob = {};
let tempEdu = {};
let tempProj = {};

/**
 * Handle simulated interview edits locally when API key is missing
 */
export function getSimulatedIntakeResponse(currentResume, userMessage, currentStep) {
  const cleanMsg = userMessage.trim();
  let updatedResume = { ...currentResume };
  let responseText = "";
  let nextStep = currentStep;

  switch (currentStep) {
    case 0:
      // Expecting Full Name
      updatedResume.personal.name = cleanMsg;
      responseText = `Thanks! I've set your name to "${cleanMsg}". What is your professional Target Job Title?`;
      nextStep = 1;
      break;

    case 1:
      // Expecting Professional Title
      updatedResume.personal.title = cleanMsg;
      responseText = `Got it, "${cleanMsg}". What Email Address should we list for contact?`;
      nextStep = 2;
      break;

    case 2:
      // Expecting Email Address
      updatedResume.personal.email = cleanMsg;
      responseText = `Saved email: ${cleanMsg}. What is your contact Phone Number?`;
      nextStep = 3;
      break;

    case 3:
      // Expecting Phone Number
      updatedResume.personal.phone = cleanMsg;
      responseText = `Phone number set to "${cleanMsg}". What is your current Location (City, State)?`;
      nextStep = 4;
      break;

    case 4:
      // Expecting Location
      updatedResume.personal.location = cleanMsg;
      responseText = `Location updated. Now, provide a short Professional Summary or list 2-3 of your top career values:`;
      nextStep = 5;
      break;

    case 5:
      // Expecting Summary
      updatedResume.personal.summary = cleanMsg;
      responseText = `Summary added! Now, list your core technical Skills (separated by commas, e.g. React, Node.js, Python):`;
      nextStep = 6;
      break;

    case 6:
      // Expecting Skills
      const skills = cleanMsg.split(",").map(s => s.trim()).filter(Boolean);
      updatedResume.skills = skills;
      responseText = `Skills updated! Let's add your Work History. What is the Company Name of your most recent employer? (Type 'none' to skip)`;
      nextStep = 7;
      break;

    case 7:
      // Expecting Company
      if (cleanMsg.toLowerCase() === 'none') {
        responseText = `Skipping work history. Let's add your Education. What is the Name of the school or university you attended? (Type 'none' to skip)`;
        nextStep = 13;
      } else {
        tempJob.company = cleanMsg;
        responseText = `Company set to "${cleanMsg}". What was your Job Title / Role there?`;
        nextStep = 8;
      }
      break;

    case 8:
      // Expecting Job Role
      tempJob.role = cleanMsg;
      responseText = `Role set to "${cleanMsg}". What were the Start and End Dates? (e.g. Jan 2022 - Present)`;
      nextStep = 9;
      break;

    case 9:
      // Expecting Dates
      tempJob.startDate = cleanMsg.split("-")[0]?.trim() || "2022";
      tempJob.endDate = cleanMsg.split("-")[1]?.trim() || "Present";
      responseText = `Dates set to "${cleanMsg}". What is the job Location? (e.g. New York, NY)`;
      nextStep = 10;
      break;

    case 10:
      // Expecting Job Location
      tempJob.location = cleanMsg;
      responseText = `Location set to "${cleanMsg}". Write 1-2 bullet points or key achievements for this position:`;
      nextStep = 11;
      break;

    case 11:
      // Expecting Job Achievements
      tempJob.description = cleanMsg;
      updatedResume.experience = [...(updatedResume.experience || []), { ...tempJob }];
      tempJob = {}; // Reset
      responseText = `Work experience added successfully! Would you like to add another job? (Type 'yes' or 'no')`;
      nextStep = 12;
      break;

    case 12:
      // Add another job?
      if (cleanMsg.toLowerCase() === 'yes') {
        responseText = `Great! What is the Company Name of this employer?`;
        nextStep = 7;
      } else {
        responseText = `Moving on. Let's add your Education history. What is the Name of your school or university? (Type 'none' to skip)`;
        nextStep = 13;
      }
      break;

    case 13:
      // Expecting School
      if (cleanMsg.toLowerCase() === 'none') {
        responseText = `Skipping education. Let's add a Project. What is the Name of your project? (Type 'none' to skip)`;
        nextStep = 17;
      } else {
        tempEdu.school = cleanMsg;
        responseText = `School set to "${cleanMsg}". What Degree or Certification did you earn?`;
        nextStep = 14;
      }
      break;

    case 14:
      // Expecting Degree
      tempEdu.degree = cleanMsg;
      responseText = `Degree set to "${cleanMsg}". What was your Graduation Date? (e.g. May 2020)`;
      nextStep = 15;
      break;

    case 15:
      // Expecting Grad Date
      tempEdu.date = cleanMsg;
      tempEdu.gpa = "GPA: 3.8/4.0"; // Preset
      updatedResume.education = [...(updatedResume.education || []), { ...tempEdu }];
      tempEdu = {}; // Reset
      responseText = `Education added! Would you like to add another education entry? (Type 'yes' or 'no')`;
      nextStep = 16;
      break;

    case 16:
      // Add another education?
      if (cleanMsg.toLowerCase() === 'yes') {
        responseText = `What is the school or university name?`;
        nextStep = 13;
      } else {
        responseText = `Moving on. Let's add a Project. What is the Name of your project? (Type 'none' to skip)`;
        nextStep = 17;
      }
      break;

    case 17:
      // Expecting Project Name
      if (cleanMsg.toLowerCase() === 'none') {
        responseText = `All steps completed! Your resume is ready to go. Review the live preview on the right and click "Keep & Import into Workspace" to complete.`;
        nextStep = 21;
      } else {
        tempProj.name = cleanMsg;
        responseText = `Project name set to "${cleanMsg}". What technologies did you use? (e.g. React, Python)`;
        nextStep = 18;
      }
      break;

    case 18:
      // Expecting Project Tech
      tempProj.tech = cleanMsg;
      responseText = `Tech stack set. Provide a brief description of what this project does:`;
      nextStep = 19;
      break;

    case 19:
      // Expecting Project Description
      tempProj.description = cleanMsg;
      tempProj.link = "https://github.com"; // Preset
      tempProj.date = "Oct 2024"; // Preset
      updatedResume.projects = [...(updatedResume.projects || []), { ...tempProj }];
      tempProj = {}; // Reset
      responseText = `Project added! Would you like to add another project? (Type 'yes' or 'no')`;
      nextStep = 20;
      break;

    case 20:
      // Add another project?
      if (cleanMsg.toLowerCase() === 'yes') {
        responseText = `What is the name of this project?`;
        nextStep = 17;
      } else {
        responseText = `Awesome! We have completed all of your inputs. Review the live A4 preview on the right and click "Keep & Import into Workspace" to save and download.`;
        nextStep = 21;
      }
      break;

    default:
      responseText = `All resume parameters have been structured! Click "Keep & Import into Workspace" at the top of the preview to finalize.`;
  }

  return {
    message: responseText,
    resume: updatedResume,
    nextStep
  };
}
