const Resume = require("../models/Resume");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const IT_SKILLS = [
  "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust", "TypeScript",
  "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring Boot",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Firebase",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub", "GitLab",
  "Machine Learning", "AI", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn"
];
const ACTION_VERBS = [
  "developed", "implemented", "created", "designed", "built", "optimized", "improved", "enhanced",
  "led", "managed", "coordinated", "achieved", "delivered", "launched", "established", "initiated",
  "reduced", "increased", "streamlined", "automated", "integrated", "deployed", "maintained",
  "analyzed", "resolved", "collaborated", "contributed", "executed", "architected", "engineered"
];

const SOFT_SKILLS = [
  "teamwork", "communication", "leadership", "problem-solving", "critical thinking",
  "time management", "adaptability", "collaboration", "creativity", "attention to detail"
];

const CONTACT_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  linkedin: /linkedin\.com\/in\/[\w-]+/i,
  github: /github\.com\/[\w-]+/i,
  portfolio: /(portfolio|website|site)[\s:]+https?:\/\/[\w.-]+/i
};

exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
    const mimeType = req.file.mimetype;
    let extractedText = "";

    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/msword") {
       const result = await mammoth.extractRawText({ path: filePath });
       extractedText = result.value;
    } else {
       return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or DOCX file." });
    }

    // Split text into lines
    const lines = extractedText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    // Detect Sections
    const sections = new Map();
    let currentSection = "Summary";
    const sectionKeywords = [
      { names: ["Education", "Academic", "Qualification"], key: "Education" },
      { names: ["Experience", "Work Experience", "Employment", "Professional Experience"], key: "Experience" },
      { names: ["Projects", "Project", "Personal Projects"], key: "Projects" },
      { names: ["Skills", "Technical Skills", "Core Competencies", "Expertise"], key: "Skills" },
      { names: ["Achievements", "Accomplishments", "Awards"], key: "Achievements" },
      { names: ["Summary", "Profile", "About", "Objective"], key: "Summary" }
    ];
    
    lines.forEach(line => {
      const upperLine = line.toUpperCase().trim();
      // Only match if the line is exactly the section name or starts with it, avoiding false positives
      let matched = false;
      for (const section of sectionKeywords) {
        for (const name of section.names) {
          if (upperLine === name.toUpperCase() ||
              (upperLine.startsWith(name.toUpperCase()) && line.length < 50)) {
            currentSection = section.key;
            matched = true;
            break;
          }
        }
        if (matched) break;
      } 
      if(!matched) {
        const text = sections.get(currentSection) || "";
        sections.set(currentSection, text + (text ? "\n" : "") + line);
      }
    });

    // Extract skills 
    let extractedSkills=[];

    const skillsText = sections.get("Skills") || "";
    if (skillsText) {
       // Define category labels to remove
      const categoryLabels = [
        'Languages', 'Frameworks', 'Developer Tools', 'Databases',
        'Frontend', 'Backend', 'Core Concepts', 'Cloud', 'Libraries',
        'Tools', 'Technologies', 'Skills', 'Technical Skills'
      ];
      
      // Remove all category labels from the text
      let cleanedText = skillsText;
      categoryLabels.forEach(label => {
        // Remove "Label:" pattern (case insensitive)
        const regex = new RegExp(`\\b${label}\\s*:\\s*`, 'gi');
        cleanedText = cleanedText.replace(regex, '');
      });
      
      // Split by comma, semicolon, OR newline to get individual skills
      const allSkills = cleanedText.split(/[,;\n]+/);
      
      allSkills.forEach(skill => {
        let cleanSkill = skill.trim()
          .replace(/^[\-•\*\s]+/, '') // Remove leading bullets/dashes
          .replace(/[\(\)]/g, '') // Remove parentheses
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
        
        // Skip if empty or if it's still a category label
        if (cleanSkill.length >= 1 &&
            cleanSkill.length <= 50 &&
            !categoryLabels.some(label => label.toLowerCase() === cleanSkill.toLowerCase())) {
          
          const alreadyExists = extractedSkills.find(s =>
            s.toLowerCase() === cleanSkill.toLowerCase()
          );
          
          if (!alreadyExists) {
            extractedSkills.push(cleanSkill);
          }
        }
      });
    }

    // Additional criteria inckuded for readiness score
    let readinessScore = 0;
    const suggestions = [];
    const scoreBreakdown = {};

    // 1. CONTENT QUALITY (20 points)
    let contentScore = 0;
    
    // Check for action verbs
    const actionVerbCount = ACTION_VERBS.filter(verb =>
      new RegExp(`\\b${verb}\\b`, 'i').test(extractedText)
    ).length;
    if (actionVerbCount >= 5) {
      contentScore += 7;
    } else if (actionVerbCount >= 3) {
      contentScore += 4;
      suggestions.push("Use more strong action verbs (e.g., developed, implemented, optimized) to describe your achievements.");
    } else {
      contentScore += 2;
      suggestions.push("Add strong action verbs to make your accomplishments more impactful.");
    }

    // Check for quantified achievements (numbers/percentages)
    const quantifiedPattern = /\d+%|\d+\+|increased|decreased|reduced|improved.*\d+/gi;
    const quantifiedMatches = extractedText.match(quantifiedPattern) || [];
    if (quantifiedMatches.length >= 3) {
      contentScore += 8;
    } else if (quantifiedMatches.length >= 1) {
      contentScore += 4;
      suggestions.push("Add more quantified achievements (e.g., 'increased efficiency by 30%') to demonstrate impact.");
    } else {
      contentScore += 1;
      suggestions.push("Include quantified achievements with numbers and percentages to show measurable impact.");
    }

    // Check content length (not too short)
    if (extractedText.length > 1000) {
      contentScore += 5;
    } else if (extractedText.length > 500) {
      contentScore += 3;
      suggestions.push("Expand your resume content with more detailed descriptions of your work and projects.");
    } else {
      contentScore += 1;
      suggestions.push("Your resume seems too brief. Add more details about your experience and achievements.");
    }

    scoreBreakdown.contentQuality = contentScore;
    readinessScore += contentScore;

    // 2. SKILLS COVERAGE (20 points)
    let skillsScore = 0;
    
    // Hard skills
    const hardSkillsCount = extractedSkills.length;
    if (hardSkillsCount >= 8) {
      skillsScore += 12;
    } else if (hardSkillsCount >= 5) {
      skillsScore += 8;
      suggestions.push("Add more technical skills relevant to your target role.");
    } else if (hardSkillsCount >= 3) {
      skillsScore += 5;
      suggestions.push("Expand your skills section with more relevant technical skills.");
    } else {
      skillsScore += 2;
      suggestions.push("Add a comprehensive skills section with relevant technical skills.");
    }

    // Soft skills
    const softSkillsFound = SOFT_SKILLS.filter(skill =>
      new RegExp(`\\b${skill}\\b`, 'i').test(extractedText)
    ).length;
    if (softSkillsFound >= 3) {
      skillsScore += 8;
    } else if (softSkillsFound >= 1) {
      skillsScore += 4;
      suggestions.push("Mention more soft skills like teamwork, communication, or leadership.");
    } else {
      skillsScore += 1;
      suggestions.push("Include soft skills (e.g., teamwork, communication, problem-solving) in your resume.");
    }

    scoreBreakdown.skillsCoverage = skillsScore;
    readinessScore += skillsScore;

    // 3. STRUCTURE & FORMATTING (15 points)
    let structureScore = 0;

    // Check for essential sections
    const requiredSections = ["Summary", "Skills", "Experience", "Projects", "Education"];
    const foundSections = requiredSections.filter(sec => sections.has(sec));
    
    if (foundSections.length === 5) {
      structureScore += 10;
    } else if (foundSections.length >= 4) {
      structureScore += 7;
      const missing = requiredSections.filter(sec => !sections.has(sec));
      suggestions.push(`Add missing section(s): ${missing.join(", ")}`);
    } else if (foundSections.length >= 3) {
      structureScore += 4;
      const missing = requiredSections.filter(sec => !sections.has(sec));
      suggestions.push(`Your resume is missing key sections: ${missing.join(", ")}`);
    } else {
      structureScore += 2;
      suggestions.push("Add essential sections: Summary, Skills, Experience, Projects, and Education.");
    }

    // Check for proper bullet points (lines starting with • or -)
    const bulletPoints = extractedText.match(/^[\s]*[•\-\*]/gm) || [];
    if (bulletPoints.length >= 10) {
      structureScore += 5;
    } 
    else if (bulletPoints.length >= 5) {
      structureScore += 3;
      suggestions.push("Use more bullet points to improve readability and structure.");
    }else { 
        structureScore += 1;
        suggestions.push("Format your content with bullet points for better readability.");
      }
  
      scoreBreakdown.structureFormatting = structureScore;
      readinessScore += structureScore;
  
      // 4. EXPERIENCE & PROJECTS STRENGTH (20 points)
      let experienceScore = 0;
      
      // Experience section quality
      const experienceText = sections.get("Experience") || "";
      if (experienceText.length > 300) {
        experienceScore += 10;
      } else if (experienceText.length > 150) {
        experienceScore += 6;
        suggestions.push("Expand your experience section with more detailed descriptions of your roles and achievements.");
      } else if (experienceText.length > 0) {
        experienceScore += 3;
        suggestions.push("Add more details to your experience section, including responsibilities and achievements."); } 
        else {
          experienceScore += 1;
          suggestions.push("Add an Experience section describing your work history and accomplishments.");
    }

    // Projects section quality
    const projectsText = sections.get("Projects") || "";
    if (projectsText.length > 200) {
      experienceScore += 10;
    } else if (projectsText.length > 100) {
      experienceScore += 6;
      suggestions.push("Expand your projects section with more details about technologies used and impact.");
    } else if (projectsText.length > 0) {
      experienceScore += 3;
      suggestions.push("Add more project details including tech stack, your role, and measurable outcomes.");
    } else {
      experienceScore += 1;
      suggestions.push("Add a Projects section showcasing your practical work and problem-solving skills.");
    }

    scoreBreakdown.experienceProjects = experienceScore;
    readinessScore += experienceScore;

    // 5. COMPLETENESS (15 points)
    let completenessScore = 0;
    
    // Contact details
    const hasEmail = CONTACT_PATTERNS.email.test(extractedText);
    const hasPhone = CONTACT_PATTERNS.phone.test(extractedText);
    if (hasEmail && hasPhone) {
      completenessScore += 5;
    } else if (hasEmail || hasPhone) {
      completenessScore += 3;
      suggestions.push("Include both email and phone number for complete contact information.");
    } else {
      completenessScore += 1;
      suggestions.push("Add contact details (email and phone number) at the top of your resume.");
    }

    // Professional links
    const hasLinkedIn = CONTACT_PATTERNS.linkedin.test(extractedText);
    const hasGitHub = CONTACT_PATTERNS.github.test(extractedText);
    const hasPortfolio = CONTACT_PATTERNS.portfolio.test(extractedText);
    
    const linksCount = [hasLinkedIn, hasGitHub, hasPortfolio].filter(Boolean).length;
    if (linksCount >= 2) {
      completenessScore += 10;
    } else if (linksCount === 1) {
      completenessScore += 5;
      suggestions.push("Add more professional links (LinkedIn, GitHub, or portfolio) to showcase your online presence.");
    } else {
      completenessScore += 2;
      suggestions.push("Include professional links like LinkedIn, GitHub, or portfolio to strengthen your profile.");
    }

    scoreBreakdown.completeness = completenessScore;
    readinessScore += completenessScore;

    // 6. READABILITY & CLARITY (10 points)
    let readabilityScore = 0;
    
    // Check for concise bullet points (not long paragraphs)
    const textLines = extractedText.split('\n').filter(line => line.trim().length > 0);
    const longLines = textLines.filter(line => line.length > 150).length;
    const totalLines = textLines.length;
    
    if (totalLines > 0 && longLines / totalLines < 0.2) {
      readabilityScore += 5;
    } else if (totalLines > 0 && longLines / totalLines < 0.4) {
      readabilityScore += 3;
      suggestions.push("Break down long paragraphs into shorter, scannable bullet points.");
    } else {
      readabilityScore += 1;
      suggestions.push("Use short, concise bullet points instead of long paragraphs for better readability.");
    }

    // Check for professional language (avoid informal words)
    const informalWords = /\b(gonna|wanna|kinda|sorta|yeah|nope|stuff|things|lots of|very|really)\b/gi;
    const informalMatches = extractedText.match(informalWords) || [];
    if (informalMatches.length === 0) {
      readabilityScore += 5;
    } else if (informalMatches.length <= 2) {
      readabilityScore += 3;
      suggestions.push("Replace informal language with professional terminology.");
    } else {
      readabilityScore += 1;
      suggestions.push("Use professional, formal language throughout your resume.");
    }

    scoreBreakdown.readabilityClarity = readabilityScore;
    readinessScore += readabilityScore;

    // Final suggestions based on overall score
    if (readinessScore >= 85) {
      suggestions.unshift("🎉 Excellent! Your resume is well-crafted and ready for applications.");
    } else if (readinessScore >= 70) {
      suggestions.unshift("✅ Good resume! Address the suggestions below to make it even stronger.");
    } else if (readinessScore >= 50) {
      suggestions.unshift("⚠️ Your resume needs improvement. Focus on the key areas mentioned below.");
    } else {
      suggestions.unshift("❌ Your resume requires significant work. Please address all the suggestions below.");
    }
    const parsedData = {
      sections: Object.fromEntries(sections),
      skills: extractedSkills,
      readinessScore,
      scoreBreakdown,
      suggestions
    };

    const resume = await Resume.create({
      user: req.user,
      file: req.file.filename,
      parsedData
    });

    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze resume", details: error.message, stack: error.stack });
  }
};

exports.uploadResume = async (req, res) => {

  const resume = await Resume.create({
    user: req.user,
    file: req.file.filename
  });

  res.json(resume);
};

exports.getResumes = async (req, res) => {

  const resumes = await Resume.find({ user: req.user });
  res.json(resumes);

};

exports.deleteResume = async (req, res) => {

  await Resume.findOneAndDelete({
    _id: req.params.id,
    user: req.user
  });

  res.json({ message: "Resume deleted" });
};