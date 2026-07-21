export type TabId = "home" | "career" | "projects" | "attributes";

export interface Profile {
  name: string;
  gradYear: string;
  tagline: string;
  summary: string;
  email: string;
  linkedin: string;
  github: string;
  leetcode: string;
  education: {
    school: string;
    degree: string;
    location: string;
    period: string;
    cgpa: string;
  };
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
  certificateUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  period: string;
  stack: string[];
  highlights: string[];
  metrics?: string[];
  links: {
    github?: string;
    paper?: string;
    demo?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  certificateUrl?: string;
}

export interface SkillStat {
  label: string;
  value: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  stats: SkillStat[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  verifyUrl?: string;
}

export interface RadarSkill {
  subject: string;
  value: number;
  fullMark: number;
}

export interface EducationQualification {
  id: string;
  year: string;
  milestone: string;
  detail?: string;
  imageKey: "2020" | "2022" | "2026";
  isActive?: boolean;
}

export const educationQualifications: EducationQualification[] = [
  {
    id: "class-10",
    year: "2020",
    milestone: "Completed Class 10",
    imageKey: "2020",
  },
  {
    id: "class-12",
    year: "2022",
    milestone: "Completed Class 12",
    imageKey: "2022",
  },
  {
    id: "college",
    year: "2026",
    milestone: "Graduated College",
    detail: "B.Tech CSE · VIT",
    imageKey: "2026",
    isActive: true,
  },
];

export const tabs: { id: TabId; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "career", label: "CAREER" },
  { id: "projects", label: "PROJECTS" },
  { id: "attributes", label: "ATTRIBUTES" },
];

export const profile: Profile = {
  name: "SIDDHANT BHAGAT",
  gradYear: "'26",
  tagline: "AI / ML Engineer · Full-Stack Developer",
  summary:
    "Final-year CS undergraduate with hands-on experience building and deploying AI-powered systems — from training models from scratch to running open-source LLMs locally. Proficient in LLM-driven development using Claude, Qwen, DeepSeek, and Gemini API.",
  email: "siddhant.bhagat004@gmail.com",
  linkedin: "https://linkedin.com/in/siddhant-bhagatvit",
  github: "https://github.com/Siddhantbg",
  leetcode: "https://leetcode.com/Siddhantbt",
  education: {
    school: "Vellore Institute of Technology",
    degree: "B.Tech Computer Science and Engineering",
    location: "Vellore, Tamil Nadu",
    period: "Sep 2022 – Jul 2026",
    cgpa: "8.55",
  },
};

export const experiences: Experience[] = [
  {
    id: "samsung-prism",
    title: "Research & Development Intern",
    company: "Samsung PRISM",
    location: "Remote",
    period: "Dec 2024 – May 2025",
    highlights: [
      "Built an end-to-end object blending pipeline using SAM (ViT-H) and Stable Diffusion Img2Img on Cityscapes datasets.",
      "Engineered a 3-stage pipeline: SAM mask extraction, OpenCV RGBA overlay, and diffusion-based blending.",
      "Led a team of 4 from research prototype to deployable Streamlit UI with realistic cross-scene object transfers.",
    ],
    certificateUrl: "#",
  },
  {
    id: "krizpay",
    title: "Project Coordinator",
    company: "KrizPay — Crypto Payments Start-Up",
    location: "Vellore, Tamil Nadu",
    period: "Aug 2024 – Oct 2025",
    highlights: [
      "Built a responsive frontend for a crypto-to-INR payments platform; project received INR 3 lakh government grant.",
      "Coordinated frontend development tasks and timelines while mentoring a team of interns.",
    ],
  },
  {
    id: "sla-finance",
    title: "Board Member — Finance Head",
    company: "Spanish Literary Association",
    location: "VIT Vellore",
    period: "Sep 2024 – Apr 2025",
    highlights: [
      "Managed INR 20,000+ budget, secured sponsorships, and oversaw financial reporting for 10+ events.",
    ],
  },
];

export const projects: Project[] = [
  {
    id: "shl-recommender",
    title: "SHL Assessment Recommender",
    period: "Mar 2025",
    stack: ["Python", "FastAPI", "FAISS", "Sentence Transformers", "Gemini API", "React.js"],
    highlights: [
      "Built end-to-end RAG pipeline: scraped 377+ assessments, embedded with all-MiniLM-L6-v2, stored in FAISS.",
      "Integrated Gemini API for query understanding and re-ranking with tuned hyperparameters.",
      "Designed evaluation framework measuring Mean Recall@K and Precision@K with ablation studies.",
    ],
    metrics: ["65% Mean Recall@5", "Sub-500ms response times"],
    links: { github: "https://github.com/Siddhantbg" },
  },
  {
    id: "ai-code-review",
    title: "AI Code Review Assistant",
    period: "May 2025",
    stack: ["Python", "FastAPI", "DeepSeek Coder 1.3B", "Next.js", "Docker"],
    highlights: [
      "Ran DeepSeek Coder 1.3B locally via llama-cpp-python in GGUF (Q4_K_M) format.",
      "Engineered prompts for JSON-structured outputs with schema validation across languages.",
      "Added WebSocket progress, cancellation, rule engine; containerized with Docker Compose.",
    ],
    links: { github: "https://github.com/Siddhantbg" },
  },
  {
    id: "medical-ai",
    title: "Medical AI: Segmentation in Thermal Imaging",
    period: "Sep 2024",
    stack: ["Python", "CNN", "Medical Imaging"],
    highlights: [
      "Benchmarked CNN-based segmentation models on clinical thermal datasets.",
      "Developed morphological-closing refinement layer improving diagnostic precision.",
    ],
    links: { paper: "#" },
  },
  {
    id: "cnn-quantization",
    title: "CNN Optimization: Hybrid Quantization",
    period: "Dec 2024",
    stack: ["Python", "Quantization", "Edge ML"],
    highlights: [
      "Designed five-algorithm quantization pipeline achieving 4x model-size reduction (2.8GB → 700MB).",
      "Achieved 0.9pp accuracy gain — applicable to efficient LLM deployment on edge devices.",
    ],
    links: { paper: "#" },
  },
];

export const achievements: Achievement[] = [
  {
    id: "hackwar",
    title: "HackWar Winner — Best Sustainability Project",
    subtitle: "Led TrustMark blockchain team of 4, selected from 50+ teams",
    period: "Jan 2025",
    certificateUrl: "#",
  },
  {
    id: "ericsson",
    title: "EricssonEdge Academia Program — Top 500 Global",
    subtitle: "Selected from 10,000+ applicants",
    period: "Nov 2024 – Apr 2025",
    certificateUrl: "#",
  },
];

export const skillCategories: SkillCategory[] = [
  {
    id: "technical",
    name: "TECHNICAL",
    stats: [
      { label: "Python / ML", value: 92 },
      { label: "LLM / RAG", value: 90 },
      { label: "FastAPI", value: 88 },
      { label: "React / Next.js", value: 85 },
    ],
  },
  {
    id: "systems",
    name: "SYSTEMS",
    stats: [
      { label: "Docker", value: 86 },
      { label: "Linux", value: 84 },
      { label: "AWS", value: 82 },
      { label: "Azure", value: 80 },
    ],
  },
  {
    id: "fundamentals",
    name: "FUNDAMENTALS",
    stats: [
      { label: "DSA", value: 88 },
      { label: "OOP", value: 90 },
      { label: "DBMS", value: 85 },
      { label: "OS", value: 83 },
    ],
  },
  {
    id: "languages",
    name: "LANGUAGES",
    stats: [
      { label: "Python", value: 92 },
      { label: "Java", value: 85 },
      { label: "C++", value: 82 },
      { label: "TypeScript", value: 86 },
    ],
  },
];

export const radarSkills: RadarSkill[] = [
  { subject: "AI / ML", value: 92, fullMark: 99 },
  { subject: "Backend", value: 88, fullMark: 99 },
  { subject: "Frontend", value: 85, fullMark: 99 },
  { subject: "Cloud", value: 82, fullMark: 99 },
  { subject: "Systems", value: 84, fullMark: 99 },
  { subject: "Research", value: 87, fullMark: 99 },
];

export const certifications: Certification[] = [
  {
    name: "Azure AI Fundamentals (AI-900)",
    issuer: "Microsoft",
    date: "Jul 2024",
    verifyUrl: "#",
  },
  {
    name: "AWS Solutions Architect — Associate (SAA-C03)",
    issuer: "Amazon Web Services",
    date: "Jul 2025",
    verifyUrl: "#",
  },
];

export const tools = ["Git", "Docker", "Linux", "Postman"];

export const languages = ["Python", "Java", "C++", "JavaScript", "TypeScript", "SQL"];

export const featuredProjectId = "shl-recommender";
export const featuredExperienceId = "samsung-prism";

/* ── Career / MY PRO tab ── */

export interface CareerStatistic {
  label: string;
  value: string | number;
}

export interface CareerAttribute {
  label: string;
  value: number;
}

export interface RoleBreakdown {
  label: string;
  percent: number;
  color: string;
}

/** 3D character model in `public/models/animations/`. */
export const CAREER_MODEL_PATH = "/models/animations/Developer.glb";

export const careerModelAnimations = {
  idle: "/models/animations/idle.fbx",
  clapping: "/models/animations/clapping.fbx",
  salute: "/models/animations/salute.fbx",
  victory: "/models/animations/victory.fbx",
} as const;

export type CareerAnimationId = keyof typeof careerModelAnimations;

export const careerProfile = {
  overallRating: 87,
  role: "AI / ML Engineer",
  roleAbbr: "MLE",
  location: "Vellore, IN",
  education: "VIT · B.Tech CSE",
  badgeNumber: 26,
};

export const careerSubTabs = [
  { id: "overview", label: "OVERVIEW" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "achievements", label: "ACHIEVEMENTS" },
  { id: "contact", label: "CONTACT" },
] as const;

export const careerStatistics: CareerStatistic[] = [
  { label: "Projects Shipped", value: 8 },
  { label: "Internships", value: 3 },
  { label: "Hackathons Won", value: 2 },
  { label: "Certifications", value: 2 },
  { label: "Technologies Used", value: "15+" },
  { label: "Team Size Led", value: 4 },
];

export const careerAttributes: CareerAttribute[] = [
  { label: "Machine Learning", value: 92 },
  { label: "LLM / RAG Systems", value: 90 },
  { label: "Python / Backend", value: 88 },
  { label: "React / Next.js", value: 85 },
  { label: "Cloud (AWS / Azure)", value: 82 },
  { label: "Research & Papers", value: 87 },
  { label: "System Design", value: 84 },
  { label: "DevOps / Docker", value: 83 },
];

export const roleBreakdown: RoleBreakdown[] = [
  { label: "AI / ML", percent: 45, color: "#4caf50" },
  { label: "Full-Stack", percent: 30, color: "#2196f3" },
  { label: "Research", percent: 15, color: "#ff9800" },
  { label: "DevOps", percent: 10, color: "#9c27b0" },
];
