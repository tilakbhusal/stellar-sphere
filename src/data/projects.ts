export type Project = {
  slug: string;
  title: string;
  year: string;
  kind: "Energy analytics" | "Feasibility study" | "Design & fabrication" | "Research";
  summary: string;
  points?: string[];
  stack: string[];
  funder?: string;
  /**
   * Optional headline figures. Rendered as a small readout strip on the card.
   * Add `chart: true` and drop a React chart component in `src/components/charts/`
   * when a project graduates to a full case study.
   */
  metrics?: { value: string; label: string }[];
  chart?: boolean;
};

export const projects: Project[] = [
  {
    slug: "heating-tunnel-energy-analytics",
    title: "Energy analytics in action: heating tunnel study",
    year: "2024",
    kind: "Energy analytics",
    summary:
      "Interval-data study of a production heating tunnel, isolating the load actually attributable to process heat and separating it from idle and standby operation.",
    points: [
      "Built the baseline from metered interval data and production schedules.",
      "Quantified idle-time losses and the savings available from scheduling and setpoint control.",
    ],
    stack: ["Python", "Excel", "Interval metering"],
    metrics: [{ value: "24 h", label: "profile resolution" }],
  },
  {
    slug: "quality-inspection-machine-learning",
    title: "Quality inspection using machine learning",
    year: "2024",
    kind: "Research",
    summary:
      "Classification model for automated visual defect detection on a manufacturing line, trading off false-accept rate against inspection throughput.",
    stack: ["Python", "scikit-learn", "Computer vision"],
  },
  {
    slug: "gasoline-to-electric-motorcycle",
    title: "Gasoline-to-electric motorcycle conversion",
    year: "2023",
    kind: "Feasibility study",
    summary:
      "Techno-economic and environmental study of converting gasoline motorcycles to electric drive in Nepal, covering drivetrain design through payback.",
    points: [
      "Designed the technical parameters: drive, battery pack, and CAD model.",
      "Analyzed energy consumption, local emissions, and carbon savings from conversion.",
      "Assessed techno-economic viability in the Nepali market.",
    ],
    stack: ["SolidWorks", "Techno-economic analysis", "Emissions modeling"],
    funder: "Ministry of Physical Infrastructure and Transport, Nepal",
  },
  {
    slug: "solar-mini-grid-feasibility",
    title: "Solar mini-grid feasibility study",
    year: "2023",
    kind: "Feasibility study",
    summary:
      "Technical and economic viability assessment of a decentralized solar mini-grid serving a remote village, including load forecasting and sizing.",
    points: [
      "Evaluated the technical and economic viability of the mini-grid system.",
      "Assessed the wider potential for decentralized energy in similar communities.",
    ],
    stack: ["PV sizing", "LCOE analysis", "Load forecasting"],
  },
  {
    slug: "sustainable-electric-transportation",
    title: "Energising development: sustainable electric transportation",
    year: "2021",
    kind: "Research",
    summary:
      "Co-designed electric transportation solutions intended to support local livelihoods and inclusive economic growth in the rural global south.",
    stack: ["Co-design", "Field research"],
    funder: "Global Challenge Research Fund",
  },
  {
    slug: "disinfection-robotics",
    title: "Disinfection robotics for hospital and quarantine settings",
    year: "2021",
    kind: "Design & fabrication",
    summary:
      "Design and fabrication of a mobile disinfectant robot for hospital and quarantine use during the COVID-19 pandemic.",
    stack: ["SolidWorks", "Sensors & actuators", "Fabrication"],
    funder: "Nepal Academy of Science and Technology",
  },
];
