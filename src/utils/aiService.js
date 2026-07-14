/**
 * Service utility to interact with the Google Gemini API to generate structured resumes.
 */

// Model schema matching the client application state
const RESUME_RESPONSE_SCHEMA = {
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
};

/**
 * Call Gemini API using native fetch interface
 */
export async function generateResumeFromAi(apiKey, inputs) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API Key is required to call the live service. Configure VITE_GEMINI_API_KEY in the .env file.");
  }

  const promptText = `
    You are an expert resume developer and professional ATS optimization specialist.
    Create a highly professional resume for the following candidate:
    - Name: ${inputs.name || "John Doe"}
    - Target Job Title: ${inputs.role}
    - Focus/Industry: ${inputs.focus || "Technology"}
    - Tone style: ${inputs.tone || "Professional"}
    - Candidate Achievements & Raw details:
    ${inputs.details || "No details provided"}

    Guidelines:
    1. Structure the response strictly in JSON format according to the provided schema.
    2. Professional summary should be engaging, concise (around 40-70 words) and list exact core strengths.
    3. Work experience descriptions MUST be written in bullet points (separated by newlines) where each bullet point starts with a strong action verb (e.g. Optimized, Spearheaded, Engineered) and quantifies the business impact with specific percentages (e.g. 25%), dollar amounts, or time savings.
    4. Projects must utilize modern tools and have descriptive details.
    5. The skills array must list key tech stacks, tools, and methodologies aligned with the role.
  `;

  // We use gemini-3.5-flash which supports responseSchema
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESUME_RESPONSE_SCHEMA
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
      throw new Error("Empty response returned from the Gemini AI endpoint.");
    }

    const parsedResume = JSON.parse(textContent);
    return parsedResume;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

/**
 * High-quality simulation generator for preview and testing when API key is not supplied.
 */
export function getSimulationData(inputs) {
  const name = inputs.name || "Sarah Connor";
  const role = inputs.role || "Senior Full-Stack Engineer";
  const focus = inputs.focus || "SaaS & Cloud Computing";
  const _tone = inputs.tone || "Professional";

  // Check if name contains 'raushan'
  if (name.toLowerCase().includes("raushan")) {
    return {
      personal: {
        name: "RAUSHAN KUMAR BAITHA",
        title: "Computer Science",
        email: "raushanbaitha12@gmail.com",
        phone: "+91 7892750656",
        location: "Chikkabanavara, Bengaluru-560090",
        website: "",
        linkedin: "https://www.linkedin.com/in/raushan123bbb233/",
        github: "https://github.com/raushankumarbaitha",
        summary: "Results-driven and detail-oriented Computer Science and Engineering graduate seeking an entry-level position to kickstart a career in software development or IT solutions. Possess a strong foundation in computer science principles, programming, and emerging technologies.\n• Programming Languages: Python, Java\n• Web Development: Skilled in HTML, CSS, Bootstrap, JavaScript\n• Data Analytics: Hands-on experience with SQL, Power BI, and data visualization.\n• Artificial Intelligence & Machine Learning: Exposure to building ML models and working with deep learning concepts.\n• Data Structures and Algorithms (DSA): Expertise in problem-solving and optimizing code for efficiency."
      },
      experience: [
        {
          company: "Edunet Foundation",
          role: "EY Company Intern",
          startDate: "Dec 2018",
          endDate: "Jan 2019",
          location: "Bengaluru, Karnataka",
          description: "Completed an internship from Edunet Foundation in association with EY company, contributing to an e-commerce website project using Python Django."
        }
      ],
      education: [
        {
          school: "Sri Krishna Institute of Technology",
          degree: "Computer Science",
          date: "Dec 2015 - May 2019",
          gpa: "CGPA: 8.16"
        }
      ],
      projects: [
        {
          name: "Identifying Blood Group from Fingerprints Using Image Processing",
          tech: "Python, NumPy, Pandas, CNN, Flask, TensorFlow",
          link: "",
          date: "Nov 2018 - May 2019",
          description: "This project involved using image processing techniques to identify blood groups from fingerprint images."
        },
        {
          name: "Web Scraping using OpenAI",
          tech: "Python, FAISS, Sentence-Transformers, OpenAI API, BeautifulSoup, NumPy",
          link: "",
          date: "June 2018 - July 2018",
          description: "This project scrapes website content, converts it into embeddings, stores them in a FAISS vector database, and generates responses using OpenAI's GPT-3.5 model."
        },
        {
          name: "Text-to-Image Generator using Generative AI",
          tech: "Python, OpenAI API, PIL (Pillow), Requests, BytesIO",
          link: "",
          date: "Aug 2019",
          description: "This project generates images from text descriptions using OpenAI's DALL-E API, retrieves the generated image, and displays it locally."
        },
        {
          name: "Text Summarization using NLP",
          tech: "Python, Hugging Face Transformers, T5, PyTorch",
          link: "",
          date: "Sep 2018",
          description: "This project uses the T5 pre-trained model to generate a concise summary of a given text by leveraging transformer-based natural language processing."
        },
        {
          name: "Chatbot using LLMs",
          tech: "Python, Streamlit, NLTK, Scikit-learn, Logistic Regression, TF-IDF",
          link: "",
          date: "Oct 2018",
          description: "This project involves building a chatbot using machine learning, where user input is matched with predefined intents using TF-IDF vectorization and a Logistic Regression classifier."
        }
      ],
      skills: [
        "Python", "Java", "SQL", "Power BI", "DSA", "Machine Learning", "Generative AI",
        "HTML", "CSS", "JavaScript", "Bootstrap", "React.js",
        "VS Code", "PyCharm", "Eclipse", "Git", "Android Studio"
      ]
    };
  }

  // Customize mock experience based on role
  let mockSummary = `Performance-driven ${role} with 5+ years of specialized expertise in ${focus}. Proven history of deploying scalable architectures and optimizing development lifecycles. Committed to writing clean code, boosting database efficiency, and leading agile engineering teams to deliver high-quality digital products.`;
  
  let mockExperience = [
    {
      company: "Apex Global Technologies",
      role: `Lead ${role}`,
      startDate: "Mar 2023",
      endDate: "Present",
      location: "San Francisco, CA",
      description: `Led a team of 5 engineers to design and launch a serverless analytics engine in ${focus}, boosting processing throughput by 42%.\nOptimized database indexing schemas, reducing query latency by 180ms and memory spikes by 25%.\nSpearheaded CI/CD migration to automated pipelines, cutting release cycles from 7 days to under 15 minutes.`
    },
    {
      company: "Stratum Digital Corp",
      role: role.replace("Senior ", ""),
      startDate: "Jul 2020",
      endDate: "Feb 2023",
      location: "Austin, TX",
      description: `Engineered responsive, client-facing dashboard portals handling over 50,000 active monthly corporate queries.\nRefactored legacy state-management components, raising web performance metrics by 35% and improving SEO rankings.\nCollaborated directly with product managers to deliver 12+ feature releases, maintaining 90%+ unit test coverage.`
    }
  ];

  let mockProjects = [
    {
      name: "QuantEdge Analytics Dashboard",
      tech: "React, Next.js, Node.js, GraphQL, PostgreSQL",
      link: "https://github.com/simulated-user/quant-edge",
      date: "Sep 2024",
      description: "Designed a real-time data analytical dashboard monitoring SaaS server nodes. Integrated live GraphQL feeds and server-side rendering pipelines."
    },
    {
      name: "AutoATS Smart Auditor",
      tech: "TypeScript, Python, AWS Lambda, TailwindCSS",
      link: "https://github.com/simulated-user/ats-auditor",
      date: "Jan 2024",
      description: "Developed a serverless script checking resume nodes against ATS architectures, scoring keyword densities and metrics."
    }
  ];

  let mockSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "GraphQL", 
    "PostgreSQL", "MongoDB", "AWS (S3/Lambda)", "Docker", "Git", "CI/CD Pipelines", 
    "RESTful APIs", "Agile Methodologies", "Unit Testing (Jest)"
  ];

  // Adjust content if the user provided specific accomplishments/details
  if (inputs.details && inputs.details.trim().length > 10) {
    mockSummary = `Tailored ${role} specializing in ${focus}. Focused on the execution of key initiatives: ${inputs.details.slice(0, 120)}...`;
    
    // Inject details into first experience description if relevant
    mockExperience[0].description = `${inputs.details}\n${mockExperience[0].description}`;
  }

  return {
    personal: {
      name: name,
      title: role,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: "+1 (555) 124-5896",
      location: "San Francisco, CA",
      website: `https://${name.toLowerCase().replace(/\s+/g, "")}.io`,
      linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(/\s+/g, "")}`,
      github: `https://github.com/in/${name.toLowerCase().replace(/\s+/g, "")}`,
      summary: mockSummary
    },
    experience: mockExperience,
    education: [
      {
        school: "University of California, Berkeley",
        degree: "B.S. in Computer Science & Engineering",
        date: "May 2020",
        gpa: "GPA: 3.85/4.0"
      }
    ],
    projects: mockProjects,
    skills: mockSkills
  };
}

const UPLOAD_ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    score: { type: "INTEGER" },
    breakdown: {
      type: "OBJECT",
      properties: {
        completeness: { type: "INTEGER" },
        actionVerbs: { type: "INTEGER" },
        quantifiable: { type: "INTEGER" },
        formatting: { type: "INTEGER" }
      },
      required: ["completeness", "actionVerbs", "quantifiable", "formatting"]
    },
    recommendations: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    extractedResume: {
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
  required: ["score", "breakdown", "recommendations", "extractedResume"]
};

/**
 * Sends a PDF or TXT file to Gemini for structured ATS analysis and data extraction
 */
export async function analyzeUploadedResume(apiKey, fileData, mimeType, isBase64 = false) {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("API key is required to call the live service. Please verify VITE_GEMINI_API_KEY in the .env file.");
  }

  const promptText = `
    You are a world-class executive resume writer and ATS auditor.
    Analyze the uploaded resume document to perform a thorough ATS audit:
    1. Score the resume from 0 to 100 based on completeness (up to 25 pts), action verbs (up to 25 pts), quantifiable metrics/business impact (up to 25 pts), and formatting standards (up to 25 pts).
    2. Provide a list of 3-5 actionable recommendations to optimize the resume for ATS filtering.
    3. Extract all details (Name, title, email, phone, experiences, education, projects, skills) into the requested JSON schema structure under 'extractedResume' so the user can import it directly. Ensure descriptions for experience and projects are detailed.
  `;

  let contentPart;
  if (isBase64) {
    // Strip data URI header if present
    const base64Clean = fileData.replace(/^data:[^;]+;base64,/, '');
    contentPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Clean
      }
    };
  } else {
    contentPart = {
      text: `Resume Text:\n---\n${fileData}\n---\n`
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              contentPart,
              { text: promptText }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: UPLOAD_ANALYSIS_SCHEMA
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
      throw new Error("Empty response returned from the Gemini AI analysis engine.");
    }

    return JSON.parse(textContent);
  } catch (error) {
    console.error("Gemini Resume Analysis API call failed:", error);
    throw error;
  }
}

/**
 * Returns a high-fidelity simulated response for uploads during simulation fallback mode
 */
export async function getSimulatedUploadAnalysis(fileName) {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const isRaushan = fileName.toLowerCase().includes("raushan") || fileName.toLowerCase().includes("kumar");

  const extractedResume = {
    personal: {
      name: isRaushan ? "RAUSHAN KUMAR BAITHA" : "Jane Doe",
      title: isRaushan ? "Software Developer Intern" : "Senior Frontend Developer",
      email: isRaushan ? "raushanbaitha12@gmail.com" : "jane.doe@example.com",
      phone: isRaushan ? "+91 7892750656" : "+1 (555) 234-5678",
      location: isRaushan ? "Bengaluru, India" : "San Francisco, CA",
      website: "",
      linkedin: "https://www.linkedin.com/in/raushan-kumar-baitha/",
      github: "https://github.com/raushankumar",
      summary: isRaushan 
        ? "Enthusiastic and detail-oriented Computer Science graduate with hands-on experience in full-stack web development and AI models. Proficient in Python, Django, SQL, and data visualization tools."
        : "Accomplished Senior Frontend Developer with 7+ years of experience building responsive SaaS applications. Dedicated to optimizing web bundle sizes, raising global unit test coverage, and implementing high-fidelity designs."
    },
    experience: [
      {
        company: isRaushan ? "Edunet Foundation" : "Starlight SaaS Technologies",
        role: isRaushan ? "Software Engineer Intern" : "Senior Frontend Developer",
        startDate: isRaushan ? "Oct 2023" : "Jan 2021",
        endDate: isRaushan ? "Mar 2024" : "Present",
        location: isRaushan ? "Bengaluru, India" : "San Francisco, CA",
        description: isRaushan
          ? "Contributed to building standard web APIs and pages using Python Django.\nCollaborated in writing SQL queries to support data parsing.\nParticipated in team Agile Scrum sprints."
          : "Led a team of 4 frontend engineers to redesign the analytics dashboard using React and Tailwind CSS, increasing page interaction speed by 40%.\nRefactored legacy state models using Redux Toolkit, decreasing memory footprint spikes by 25%.\nAuthored automated test suites raising global code coverage metrics from 50% to 92%."
      }
    ],
    education: [
      {
        school: isRaushan ? "Sri Krishna Institute of Technology" : "Stanford University",
        degree: isRaushan ? "Bachelor of Engineering in CS" : "M.S. in Computer Science",
        date: isRaushan ? "Dec 2020 - Jun 2024" : "Sep 2018 - Jun 2020",
        gpa: isRaushan ? "CGPA: 8.16" : "GPA: 3.9/4.0"
      }
    ],
    projects: [
      {
        name: isRaushan ? "Image Classification from Fingerprints" : "Auto-ATS Resume Scanner Portal",
        tech: isRaushan ? "Python, Flask, TensorFlow, OpenCV" : "React, TypeScript, Node.js, PostgreSQL",
        link: "",
        date: "Jan 2024",
        description: isRaushan
          ? "Developed an image processing script utilizing convolutional neural networks (CNNs) to analyze fingerprint templates, achieving 92% classification accuracy."
          : "Built a serverless text parser scanning resume layouts against common keyword density frameworks, reducing custom match rendering latency to under 300ms."
      }
    ],
    skills: isRaushan 
      ? ["Python", "Java", "Django", "SQL", "HTML", "CSS", "JavaScript", "Git"]
      : ["React", "TypeScript", "JavaScript", "Redux", "Tailwind CSS", "Node.js", "Jest", "Git", "Docker"]
  };

  return {
    score: 82,
    breakdown: {
      completeness: 22,
      actionVerbs: 20,
      quantifiable: 20,
      formatting: 20
    },
    recommendations: [
      "Add more active verb starters to your work experiences to emphasize impact.",
      "Quantify your project metrics (e.g. state size reduction, exact load times, transaction increases).",
      "Include links to your personal portfolio or public GitHub repositories."
    ],
    extractedResume
  };
}
