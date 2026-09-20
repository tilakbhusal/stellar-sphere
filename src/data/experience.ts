export type Role = {
  title: string;
  org: string;
  place?: string;
  start: string;
  end: string;
  bullets: string[];
  note?: { label: string; items: string[] };
};

export const work: Role[] = [
  {
    title: "Engineer",
    org: "Energy Sciences",
    place: "Ann Arbor, MI",
    start: "Jan 2026",
    end: "Present",
    bullets: [
      "Lead on-site commercial and industrial facility assessments to identify high-impact efficiency and decarbonization opportunities across compressed air networks, VFDs, packaged RTUs, AHUs, motors, process heating, lighting, and heat pumps.",
      "Work through state-specific Technical Reference Manuals, regulatory codes, and current industry research to quantify and validate custom energy savings.",
      "Build custom calculation methodologies and industry-standard calculators for thermodynamic and economic analysis, including regression modeling, bin-weather calculations, and trending-based evaluation.",
      "Calculate and validate financial incentives for industrial and commercial clients, acting as technical liaison for utility-sponsored business energy efficiency programs.",
      "Run Measurement and Verification protocols to confirm implemented project performance, sustain savings, and drive corrective action.",
      "Author engineering reports and client-ready presentations, and work directly with facility managers to move projects forward.",
      "Write and refine standard operating procedures and work instructions so deliverables stay consistent across project phases.",
    ],
  },
  {
    title: "Mechanical Design Engineer (Freelance)",
    org: "Fiverr",
    start: "2021",
    end: "2023",
    bullets: [
      "Delivered CFD, two-way FSI, and structural analysis work in ANSYS for international clients.",
      "Completed CAD projects, built simulation domains, and designed machine components in SolidWorks.",
    ],
  },
  {
    title: "Intern",
    org: "SunFarmer Nepal",
    start: "Mar 2022",
    end: "Aug 2022",
    bullets: [
      "Designed solar arrays, pumps, and motors, and produced CAD drawings for solar-powered projects.",
      "Supported system optimization, project planning, and delivery of renewable energy solutions for rural and underserved communities.",
      "Carried out site monitoring and inspection, and assisted business development and procurement.",
    ],
  },
  {
    title: "Design Lead",
    org: "Robotics Club, Pulchowk Campus",
    start: "2019",
    end: "2021",
    bullets: [
      "Designed and fabricated robot sub-assemblies and mechanisms for ABU Robocon 2019 and 2020.",
      "Designed and built a mushroom incubator for growing mushrooms in constrained space.",
    ],
  },
];

export const research: Role[] = [
  {
    title: "Graduate Research Assistant",
    org: "WVU Pollution Prevention Lab",
    place: "Morgantown, WV",
    start: "Jan 2024",
    end: "Dec 2025",
    bullets: [
      "Conducted more than 10 comprehensive energy assessments across industrial sectors in West Virginia as ASHRAE Level I and II audits.",
      "Identified and quantified efficiency and pollution prevention opportunities in lighting, HVAC, motors, compressed air, steam, and process heating systems.",
      "Used MEASUR, eQUEST, and Excel-based calculators for energy modeling, equipment analysis, and ROI estimation.",
    ],
    note: {
      label: "Thesis",
      items: [
        "A regression study on the impact of socioeconomic and demographic factors on energy consumption across residential, commercial, and industrial sectors in U.S. counties.",
        "Analyzed large datasets in Python to surface systemic disparities in energy access and usage, with the aim of informing equitable energy policy.",
        "Produced one peer-reviewed research articles and one review paper.",
      ],
    },
  },
  {
    title: "Undergraduate Researcher",
    org: "Center for Pollution Studies",
    start: "2022",
    end: "2023",
    bullets: [
      "Led a government-funded research team across three areas: gaseous emissions, the sustainability and environmental benefits of energy transition, and techno-economic analysis.",
      "Completed a study on the economic viability of a gasoline-to-electricity fuel transition in the context of Nepal.",
    ],
  },
  {
    title: "Student Researcher",
    org: "Incubation, Innovation and Entrepreneurship Center",
    start: "2020",
    end: "2021",
    bullets: [
      "Researched and developed a bike ambulance trailer, funded by the Global Challenge Research Fund, to support livelihoods in remote areas of Nepal.",
      "Designed and fabricated a disinfectant robot funded by the Nepal Academy of Science and Technology during the COVID-19 pandemic.",
    ],
  },
];

export type Credential = {
  name: string;
  issuer: string;
  abbr: string;
  featured?: boolean;
};

export const certifications: Credential[] = [
  { abbr: "CEM", name: "Certified Energy Manager", issuer: "Association of Energy Engineers", featured: true },
  { abbr: "LEED GA", name: "LEED Green Associate", issuer: "Green Business Certification Inc.", featured: true },
  { abbr: "EIT", name: "Engineer-in-Training", issuer: "NCEES", featured: true },
  { abbr: "CSWP", name: "Certified SolidWorks Professional", issuer: "Dassault Systèmes", featured: true },
  { abbr: "CEA", name: "Certified Energy Auditor", issuer: "Center for Energy Studies" },
];

export const awards = [
  { year: "2025", title: "AEE Travel Support", detail: "Association of Energy Engineers" },
  {
    year: "2024",
    title: "Fully Funded Graduate Fellowship with Tuition Waiver",
    detail: "West Virginia University",
  },
  {
    year: "2023",
    title: "Winner, Energy Hackathon",
    detail: "For techno-economic analysis and environmental benefits of fuel transition in Nepal.",
  },
  {
    year: "2022",
    title: "Research Grant",
    detail: "Ministry of Physical Infrastructure and Transport, Nepal",
  },
  {
    year: "2021",
    title: "Winner, 3D Modeling Competition",
    detail: "Best design for disinfection robotics using a microbiological approach.",
  },
  {
    year: "2020",
    title: "Tokyo Electron Award",
    detail: "International award for the best kicking mechanism, ABU Robocon 2020.",
  },
  {
    year: "2019",
    title: "Rohm Award and Nagase Award",
    detail: "ABU Robocon international preliminary rounds.",
  },
  {
    year: "2019",
    title: "Winner, Design Competition",
    detail: "National award for energy-efficient pumping systems in residential buildings.",
  },
];

export const training = [
  { year: "2023", title: "Harvard Aspire Leaders Fellow", detail: "Leadership and professional development" },
  { year: "2023", title: "Energy Audit Training for Young Engineers", detail: "Center for Energy Studies" },
  { year: "2023", title: "Energy Efficiency in Electric Motors, Boilers and Water Pumping Systems", detail: "" },
  { year: "2022", title: "Energy Efficiency and Energy Savings Potentials for Industries", detail: "Virtual practical training" },
  { year: "2022", title: "Research Methodology Training Program", detail: "" },
];

export const skills = [
  {
    group: "Energy auditing and decarbonization",
    items: [
      "Energy audits (ASHRAE Level I–III)",
      "Utility bill analysis",
      "Measurement & Verification",
      "Decarbonization strategy",
      "Equipment diagnostics",
      "Utility incentive calculation",
    ],
  },
  {
    group: "Modeling and analytics",
    items: [
      "EnergyPlus",
      "eQUEST",
      "MEASUR",
      "Python",
      "R",
      "MATLAB",
      "Regression modeling",
      "Bin-weather analysis",
      "JASP / jamovi",
    ],
  },
  {
    group: "Mechanical simulation and design",
    items: ["ANSYS (CFD, FEA)", "SolidWorks (CAD)", "Two-way FSI", "Additive manufacturing"],
  },
  {
    group: "Reporting and compliance",
    items: [
      "Technical report writing",
      "Custom calculator development",
      "Engineering SOPs",
      "Technical Reference Manuals",
    ],
  },
];

export const affiliations = [
  "Member, Alpha Pi Mu — Industrial Engineering Honor Society",
  "Member, Association of Energy Engineers (AEE)",
  "Judge, WVU Undergraduate Research Symposium (Spring and Fall 2024)",
  "Instructor, SolidWorks Training Workshops (2022)",
];
