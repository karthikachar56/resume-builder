// List of high-impact ATS action verbs
const ACTION_VERBS = new Set([
  'designed', 'developed', 'built', 'implemented', 'spearheaded', 'led', 'managed', 
  'optimized', 'improved', 'reduced', 'increased', 'orchestrated', 'architected', 
  'deployed', 'automated', 'engineered', 'created', 'executed', 'analyzed', 
  'researched', 'solved', 'debugged', 'integrated', 'customized', 'migrated',
  'administered', 'collaborated', 'delivered', 'formulated', 'headed', 'initiated',
  'refactored', 'streamlined', 'supervised', 'transformed', 'upgraded', 'maximized'
]);

// Stop words to filter out when parsing Job Description keywords
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
  'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 
  'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 
  'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 
  'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 
  'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 
  'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 
  'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 
  'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 
  'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 
  'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves',
  'the', 'using', 'experience', 'ability', 'required', 'knowledge', 'years', 'working', 'strong', 
  'skills', 'team', 'work', 'development', 'candidate', 'role', 'responsibilities', 'key'
]);

// Common technical skills catalog to help filter keywords of value
const SKILLS_CATALOG = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust', 'php', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'next.js', 'nuxt.js', 'svelte', 'jquery', 'bootstrap', 'tailwind', 'sass', 'css', 'html',
  'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'fastapi', 'graphql', 'rest', 'api',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'mariadb', 'oracle', 'dynamodb', 'cassandra', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd', 'terraform', 'ansible',
  'linux', 'unix', 'windows', 'macos', 'android', 'ios', 'scrum', 'agile', 'jira', 'confluence', 'testing', 'jest',
  'cypress', 'selenium', 'mocha', 'chai', 'webpack', 'vite', 'babel', 'typescript', 'machine learning', 'deep learning',
  'ai', 'nlp', 'data science', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'tableau', 'powerbi'
]);

/**
 * Clean and tokenize a text block into individual words
 */
function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\.\+#]/g, ' ') // keep letters, numbers, spaces, and chars like C++ or C#
    .split(/\s+/)
    .filter(word => word.trim().length > 1);
}

/**
 * Extracts candidate tech and professional keywords from raw Job Description text
 */
export function extractJDKeywords(jdText) {
  if (!jdText) return [];
  const words = tokenizeText(jdText);
  const keywordCounts = {};
  
  words.forEach(word => {
    // Filter out numbers and stop words
    if (/^\d+$/.test(word) || STOP_WORDS.has(word)) return;
    
    // Prioritize SKILLS_CATALOG or capitalized/noun terms
    // We count frequencies to pick out the core ones
    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
  });

  // Sort by frequency and cross-reference with skills catalog, prioritizing catalog
  return Object.keys(keywordCounts)
    .map(word => ({
      name: word,
      count: keywordCounts[word],
      isCatalogSkill: SKILLS_CATALOG.has(word)
    }))
    .sort((a, b) => {
      if (a.isCatalogSkill && !b.isCatalogSkill) return -1;
      if (!a.isCatalogSkill && b.isCatalogSkill) return 1;
      return b.count - a.count;
    })
    .slice(0, 15) // Limit to top 15 target keywords
    .map(item => item.name);
}

/**
 * Evaluates the full resume against standard ATS rules
 */
export function analyzeResume(resume) {
  let score = 0;
  const breakdown = {
    completeness: 0,
    actionVerbs: 0,
    quantifiable: 0,
    formatting: 0
  };
  const recommendations = [];

  if (!resume) return { score: 0, breakdown, recommendations };

  // 1. COMPLETENESS (Max 25 pts)
  let completenessPoints = 0;
  if (resume.personal?.name) completenessPoints += 4;
  if (resume.personal?.title) completenessPoints += 3;
  if (resume.personal?.summary) completenessPoints += 4;
  if (resume.experience && resume.experience.length > 0) completenessPoints += 5;
  if (resume.education && resume.education.length > 0) completenessPoints += 4;
  if (resume.skills && resume.skills.length > 0) completenessPoints += 3;
  if (resume.projects && resume.projects.length > 0) completenessPoints += 2;
  
  breakdown.completeness = completenessPoints;
  if (completenessPoints < 25) {
    if (!resume.personal?.summary) recommendations.push('Add a professional summary section to introduce your value proposition.');
    if (!resume.experience || resume.experience.length === 0) recommendations.push('Include at least one Work Experience entry.');
    if (!resume.skills || resume.skills.length === 0) recommendations.push('Add key skills to help matching filters index your profile.');
  }

  // Gather all description/bullet point texts for text scans
  const descriptions = [];
  if (resume.personal?.summary) descriptions.push(resume.personal.summary);
  
  resume.experience?.forEach(exp => {
    if (exp.description) descriptions.push(exp.description);
  });
  resume.projects?.forEach(proj => {
    if (proj.description) descriptions.push(proj.description);
  });

  const fullText = descriptions.join(' ');
  const tokenizedWords = tokenizeText(fullText);

  // 2. ACTION VERBS (Max 25 pts)
  let verbCount = 0;
  const foundVerbs = new Set();
  tokenizedWords.forEach(word => {
    if (ACTION_VERBS.has(word)) {
      foundVerbs.add(word);
      verbCount++;
    }
  });

  // Score action verbs: 1 verb = 3 points, up to 25 pts
  const verbScore = Math.min(25, foundVerbs.size * 4);
  breakdown.actionVerbs = verbScore;
  if (verbScore < 16) {
    recommendations.push(`Use more high-impact action verbs (found: ${foundVerbs.size}). Try: "spearheaded", "designed", "optimized", "architected".`);
  }

  // 3. QUANTIFIABLE METRICS (Max 25 pts)
  // Check for numbers (percentages, currency, quantities like $10k, 25%, 500k, 3x)
  const metricRegex = /(\d+%|\$\d+|\d+\s*years|\d+\s*months|\b(million|thousand|billion)\b|\d+\+?)/gi;
  const metricsFound = fullText.match(metricRegex) || [];
  
  // Score metrics: 1 metric = 5 points, up to 25 pts
  const metricScore = Math.min(25, metricsFound.length * 5);
  breakdown.quantifiable = metricScore;
  if (metricScore < 15) {
    recommendations.push('Add quantifiable metrics to your achievements (e.g., "Increased performance by 40%", "Saved 15 hours/week through automation").');
  }

  // 4. FORMATTING & CONTACT DETAILS (Max 25 pts)
  let formattingPoints = 0;
  
  // Email Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (resume.personal?.email && emailRegex.test(resume.personal.email)) {
    formattingPoints += 7;
  } else {
    recommendations.push('Provide a valid email address.');
  }

  // Phone check
  if (resume.personal?.phone && resume.personal.phone.replace(/[^\d]/g, '').length >= 7) {
    formattingPoints += 6;
  } else {
    recommendations.push('Provide a contact phone number.');
  }

  // Links check (LinkedIn, GitHub or portfolio)
  if (resume.personal?.linkedin || resume.personal?.github || resume.personal?.website) {
    formattingPoints += 6;
  } else {
    recommendations.push('Add professional links like LinkedIn or GitHub to improve outreach.');
  }

  // Length check (Not too short, not too long)
  const summaryLength = resume.personal?.summary?.split(/\s+/)?.length || 0;
  if (summaryLength >= 20 && summaryLength <= 80) {
    formattingPoints += 6;
  } else if (summaryLength > 0) {
    recommendations.push('Keep your professional summary brief and impactful (ideally 20-80 words).');
  }

  breakdown.formatting = formattingPoints;

  // Calculate overall score
  score = breakdown.completeness + breakdown.actionVerbs + breakdown.quantifiable + breakdown.formatting;

  return {
    score,
    breakdown,
    recommendations
  };
}

/**
 * Calculates match metrics between the current resume and a target Job Description
 */
export function matchJobDescription(resume, jdText) {
  if (!jdText || !resume) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      recommendations: []
    };
  }

  const jdKeywords = extractJDKeywords(jdText);
  
  // Compile all resume words and skills into a lowercase set for fast matching
  const resumeTextParts = [
    ...(resume.skills || []),
    resume.personal?.title || '',
    resume.personal?.summary || ''
  ];
  
  resume.experience?.forEach(exp => {
    resumeTextParts.push(exp.role || '');
    resumeTextParts.push(exp.description || '');
  });
  
  resume.projects?.forEach(proj => {
    resumeTextParts.push(proj.name || '');
    resumeTextParts.push(proj.description || '');
  });

  const resumeText = resumeTextParts.join(' ').toLowerCase();

  const matchedKeywords = [];
  const missingKeywords = [];

  jdKeywords.forEach(keyword => {
    // Escape special characters in keywords (e.g. C++, .NET) for regex
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Match word boundaries or specialized forms like "c++"
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    
    if (regex.test(resumeText)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  const matchRatio = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) : 0;
  const score = Math.round(matchRatio * 100);

  const recommendations = [];
  if (missingKeywords.length > 0) {
    recommendations.push(`Tailor your resume by adding missing keywords: ${missingKeywords.slice(0, 5).join(', ')}.`);
  }
  if (score < 50) {
    recommendations.push('The match rate is low. Adjust your project descriptions and profile summary to align with the core technologies in the job description.');
  } else if (score >= 80) {
    recommendations.push('Excellent match rate! Your resume aligns highly with the core keywords of the job description.');
  }

  return {
    score,
    matchedKeywords,
    missingKeywords,
    recommendations
  };
}
