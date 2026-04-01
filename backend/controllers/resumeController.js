const Resume = require("../models/Resume");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const IT_SKILLS = [
  "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust", "TypeScript",
  "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring Boot",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Firebase",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub", "GitLab"
];

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
      const parseFunc = typeof pdfParse === "function" ? pdfParse : pdfParse.PDFParse;
      const data = await parseFunc(dataBuffer);
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
    const sectionKeywords = ["Education", "Experience", "Projects", "Skills", "Achievements", "Summary"];
    
    lines.forEach(line => {
      const upperLine = line.toUpperCase();
      // Only match if the line is exactly the section name or starts with it, avoiding false positives
      const matchedSection = sectionKeywords.find(keyword => upperLine.startsWith(keyword.toUpperCase()) && line.length < 50);
      if (matchedSection) {
        currentSection = matchedSection;
      } else {
        const text = sections.get(currentSection) || "";
        sections.set(currentSection, text + (text ? "\n" : "") + line);
      }
    });

    // Extract skills (Pre-defined IT skills)
    let extractedSkills = IT_SKILLS.filter(skill => {
      // Escape for regex and match word boundaries
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(extractedText);
    });

    // Option 1: Dynamically extract unknown comma-separated skills from the "Skills" section
    const skillsText = sections.get("Skills") || sections.get("SKILLS");
    if (skillsText) {
      // Split by comma, colon, pipe, or newline
      const rawWords = skillsText.split(/[,|\n|:]+/);
      
      const ignoredWords = ["languages", "development", "tools", "databases", "frameworks", "technologies", "soft skills", "cs fundamentals", "others"];
      
      rawWords.forEach(word => {
        let cleanWord = word.trim();
        // Validate word length to ensure it isn't an entire sentence or junk
        if (cleanWord.length > 1 && cleanWord.length <= 25 && !ignoredWords.includes(cleanWord.toLowerCase())) {
          // Push to our array if it wasn't caught by the pre-defined list
          const alreadyExists = extractedSkills.find(s => s.toLowerCase() === cleanWord.toLowerCase());
          if (!alreadyExists) {
            extractedSkills.push(cleanWord);
          }
        }
      });
    }

    // Calculate Readiness Score & Suggestions
    let readinessScore = 0;
    const suggestions = [];

    // Check for essential sections
    if (sections.has("Experience")) {
      readinessScore += 25;
    } else {
      suggestions.push("Add an 'Experience' section describing your past roles and responsibilities.");
    }

    if (sections.has("Education")) {
      readinessScore += 20;
    } else {
      suggestions.push("Include an 'Education' section detailing your academic background.");
    }

    if (sections.has("Skills") || extractedSkills.length > 0) {
      readinessScore += 20;
    } else {
      suggestions.push("Add a 'Skills' section listing your technical and soft skills.");
    }

    if (sections.has("Projects")) {
      readinessScore += 15;
    } else {
      suggestions.push("Consider adding a 'Projects' section to showcase practical applications of your skills.");
    }

    if (sections.has("Summary")) {
      // If summary is just empty string or very short, it might be the default fallback
      const summaryText = sections.get("Summary");
      if (summaryText && summaryText.trim().length > 20) {
        readinessScore += 10;
      } else {
        suggestions.push("Add a professional 'Summary' to provide a quick overview of your profile.");
      }
    } else {
      suggestions.push("Add a professional 'Summary' to provide a quick overview of your profile.");
    }

    // Reward for having multiple skills
    if (extractedSkills.length >= 5) {
      readinessScore += 10;
    } else if (extractedSkills.length > 0) {
      readinessScore += 5;
      suggestions.push("Expand your skills list to include more specific and relevant technologies.");
    }

    if (readinessScore >= 80 && suggestions.length === 0) {
      suggestions.push("Your resume looks great and is structurally complete!");
    } else if (readinessScore >= 80) {
      suggestions.push("Your resume is well-structured! Consider reviewing the above suggestions for further improvement.");
    }

    const parsedData = {
      sections: Object.fromEntries(sections),
      skills: extractedSkills,
      readinessScore,
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