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

  // We use gemini-2.5-flash which supports responseSchema
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

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
