export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'Full Stack' | 'Frontend' | 'AI & Cloud' | 'Systems';
  tags: string[];
  metrics: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  accentColor: string;
}

export interface SkillCategory {
  title: string;
  iconName: string;
  skills: {
    name: string;
    level: string;
    badge?: string;
  }[];
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  highlights: string[];
  techStack: string[];
  current?: boolean;
}

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
}

export const PORTFOLIO_DATA = {
  personal: {
    name: "Mariselvam",
    initials: "M",
    title: "Full-Stack Software Engineer",
    subtitles: [
      "Building scalable web platforms",
      "React & TypeScript Enthusiast",
      "Cloud & AI Systems Architect",
      "Obsessed with UI/UX Performance"
    ],
    status: "Available for new projects & roles",
    bio: "I am a passionate software engineer dedicated to crafting resilient full-stack applications, intuitive interactive user interfaces, and robust backend architectures. With a focus on clean code, performance optimization, and delighting users, I bridge the gap between complex engineering and seamless design.",
    location: "India (Open to Remote Worldwide)",
    email: "mariselvam.dev@gmail.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    resumeUrl: "#contact",
  },

  stats: [
    { value: "3+", label: "Years Experience", sublabel: "Continuous building & shipping" },
    { value: "25+", label: "Projects Completed", sublabel: "From concept to production" },
    { value: "99.9%", label: "Uptime & Quality", sublabel: "Engineered for high reliability" },
    { value: "100%", label: "Client Satisfaction", sublabel: "Transparent delivery & speed" },
  ] as StatItem[],

  skillCategories: [
    {
      title: "Frontend Engineering",
      iconName: "Layout",
      skills: [
        { name: "React 19 / 18", level: "Expert", badge: "Core" },
        { name: "TypeScript", level: "Expert", badge: "Core" },
        { name: "Next.js", level: "Advanced" },
        { name: "Modern CSS / Animations", level: "Expert" },
        { name: "HTML5 & Web APIs", level: "Expert" },
        { name: "State Management (Zustand/Redux)", level: "Advanced" },
        { name: "Performance & Web Vitals", level: "Advanced" },
      ],
    },
    {
      title: "Backend & Systems",
      iconName: "Server",
      skills: [
        { name: "Node.js & Express", level: "Expert", badge: "Core" },
        { name: "Python / FastAPI", level: "Advanced" },
        { name: "RESTful & GraphQL APIs", level: "Expert" },
        { name: "PostgreSQL / MySQL", level: "Advanced" },
        { name: "MongoDB & Redis", level: "Advanced" },
        { name: "Authentication & OAuth2", level: "Advanced" },
      ],
    },
    {
      title: "Cloud & DevOps",
      iconName: "Cloud",
      skills: [
        { name: "Docker & Containerization", level: "Advanced" },
        { name: "AWS Services", level: "Intermediate" },
        { name: "CI/CD (GitHub Actions)", level: "Advanced" },
        { name: "Vercel & Netlify Deployment", level: "Expert" },
        { name: "Nginx & Linux Administration", level: "Intermediate" },
      ],
    },
    {
      title: "Architecture & Tools",
      iconName: "Cpu",
      skills: [
        { name: "System Design", level: "Advanced" },
        { name: "Git / GitHub Workflows", level: "Expert" },
        { name: "Vite / Modern Bundlers", level: "Expert" },
        { name: "AI Agent Integrations", level: "Advanced", badge: "Hot" },
        { name: "Test-Driven Development (TDD)", level: "Advanced" },
      ],
    },
  ] as SkillCategory[],

  projects: [
    {
      id: "allobot-portal",
      title: "AlloBot Enterprise Health Portal",
      description: "Mission-critical patient management and automated discharge coordination system with strict role-based access and real-time OTP tracking.",
      category: "Full Stack",
      tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "Twilio API"],
      metrics: "Reduced discharge turnaround time by 42%",
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com",
      featured: true,
      accentColor: "#6366f1",
    },
    {
      id: "nexus-analytics",
      title: "Nexus Real-Time Analytics Engine",
      description: "High-throughput event streaming platform with interactive data visualization dashboards, anomaly alerts, and customizable metrics.",
      category: "Full Stack",
      tags: ["Next.js", "TypeScript", "Tailored CSS", "Kafka", "WebSockets"],
      metrics: "Processes 50k+ events/sec with sub-second latency",
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com",
      featured: true,
      accentColor: "#06b6d4",
    },
    {
      id: "ai-prompt-studio",
      title: "Cognitive AI Studio & Orchestrator",
      description: "Collaborative prompt engineering and multi-agent workflow builder with visual node-based execution and version control.",
      category: "AI & Cloud",
      tags: ["React", "TypeScript", "Python", "FastAPI", "OpenAI / Gemini"],
      metrics: "Over 12,000 active automated prompt runs",
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com",
      featured: true,
      accentColor: "#ec4899",
    },
    {
      id: "hyper-ui",
      title: "HyperUI Accessible Design System",
      description: "Production-ready headless component library engineered for zero-runtime overhead, WCAG 2.1 AAA accessibility, and dark theme support.",
      category: "Frontend",
      tags: ["TypeScript", "CSS Variables", "Radix Primitives", "Vite"],
      metrics: "4.9k GitHub Stars & 15k monthly downloads",
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com",
      featured: false,
      accentColor: "#8b5cf6",
    },
    {
      id: "cloud-pulse",
      title: "CloudPulse Infrastructure Sentinel",
      description: "Microservices health monitor and automated circuit breaker alerting system with multi-region incident triage telemetry.",
      category: "Systems",
      tags: ["Go", "Docker", "Prometheus", "Grafana", "React"],
      metrics: "Zero undetected outages across 60+ microservices",
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com",
      featured: false,
      accentColor: "#10b981",
    },
    {
      id: "zenith-crypto-desk",
      title: "Zenith DEX Trading Terminal",
      description: "Low-latency financial order book visualization with trading charts, real-time depth inspection, and instant wallet execution.",
      category: "Frontend",
      tags: ["React", "TypeScript", "WebSockets", "Chart.js"],
      metrics: "60 FPS rendering under intense order updates",
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com",
      featured: false,
      accentColor: "#f59e0b",
    },
  ] as Project[],

  experience: [
    {
      period: "2023 - Present",
      role: "Senior Full-Stack Engineer",
      company: "TechNova Solutions",
      location: "Remote",
      description: "Leading frontend and API architecture for enterprise web applications, mentoring junior engineers, and driving performance optimization initiatives.",
      highlights: [
        "Architected core dashboard reducing client bundle payload by 38% and First Contentful Paint by 1.2s",
        "Pioneered migration from legacy monolith to modular TypeScript microfrontends and REST/GraphQL services",
        "Conducted code reviews, established CI/CD pipeline automation, and enforced 90%+ test coverage",
      ],
      techStack: ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL", "AWS"],
      current: true,
    },
    {
      period: "2021 - 2023",
      role: "Full-Stack Developer",
      company: "Innovate Digital Labs",
      location: "Bengaluru, India",
      description: "Delivered scalable client-facing products and internal tools for high-growth startups and digital enterprise clients.",
      highlights: [
        "Engineered real-time chat, notifications, and analytics pipelines handling 200k+ daily interactions",
        "Collaborated closely with UX designers to build pixel-perfect, accessible component systems",
        "Integrated third-party payment gateways and identity providers with bulletproof security",
      ],
      techStack: ["React", "JavaScript", "Express.js", "MongoDB", "Tailored CSS", "Redis"],
      current: false,
    },
    {
      period: "2020 - 2021",
      role: "Frontend Developer Intern",
      company: "Apex Infotech",
      location: "Tamil Nadu, India",
      description: "Developed responsive web pages, interactive landing sites, and streamlined cross-browser compatibility.",
      highlights: [
        "Converted Figma designs into production-ready responsive web pages with high semantic fidelity",
        "Optimized image pipelines and asset caching for mobile devices",
      ],
      techStack: ["HTML5", "CSS3", "JavaScript", "React", "Git"],
      current: false,
    },
  ] as ExperienceItem[],
};
