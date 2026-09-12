export const site = {
  name: "Tilak Bhusal",
  role: "Energy Engineer",
  tagline: "Industrial energy efficiency, decarbonization, and quantitative analysis.",
  location: "Ann Arbor, Michigan",
  email: "tilak.bhusal56@gmail.com",
  linkedin: "https://linkedin.com/in/tilak-bhusal-6b25aa128",
  scholar: "https://scholar.google.com/citations?user=YQO_NagAAAAJ&hl=en",
  resume: "/Tilak-Bhusal-Resume.pdf",
  cv: "/Tilak-Bhusal-CV.pdf",
  description:
    "Energy engineer specializing in industrial and commercial energy audits, measurement and verification, and data-driven decarbonization strategy.",
} as const;

export const nav = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/experience" },
  { label: "Publications", href: "/publications" },
  { label: "Projects", href: "/projects" },
  { label: "Articles", href: "/articles" },
  { label: "Contact", href: "/contact" },
] as const;

export const education = [
  {
    school: "West Virginia University",
    place: "Morgantown, WV",
    degree: "M.S., Industrial Engineering",
    years: "2024 – 2025",
  },
  {
    school: "Tribhuvan University",
    place: "Pulchowk, Nepal",
    degree: "B.S., Mechanical Engineering",
    years: "2018 – 2023",
  },
] as const;
