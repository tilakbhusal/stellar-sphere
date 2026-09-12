export type Publication = {
  authors: string[];
  year: string;
  title: string;
  venue: string;
  detail?: string;
  doi?: string;
  url?: string;
  pdf?: string;
  status?: string;
};

/** Matches the author string that should be bolded in every list. */
export const SELF = "Bhusal, T.";

export const peerReviewed: Publication[] = [
  {
    authors: ["Bhusal, T.", "Choudhury, A."],
    year: "2026",
    title:
      "Determinants of energy consumption in residential, commercial, and industrial sectors: A systematic literature review",
    venue: "Under peer review",
    status: "Submitted",
  },
  {
    authors: ["Bhusal, T.", "Timilsina, S. S.", "Nimbarte, A.", "Choudhury, A."],
    year: "2025",
    title:
      "A study on the effect of socioeconomic and demographic factors on energy consumption in residential, commercial, and industrial settings: A case study of West Virginia",
    venue: "Proceedings of the West Virginia Academy of Science, 97(1), 49–57",
    doi: "10.55632/pwvas.v97i1.1107",
    url: "https://doi.org/10.55632/pwvas.v97i1.1107",
    pdf: "https://pwvas.org/index.php/pwvas/article/view/1107/954",
  },
  {
    authors: ["Timilsina, S. S.", "Bhusal, T.", "Nimbarte, A.", "Choudhury, A."],
    year: "2025",
    title:
      "Analysis of socio-demographic, pollution, and hazard risk factors affecting life expectancy in West Virginia: A multilevel regression approach",
    venue: "Proceedings of the West Virginia Academy of Science, 97(1)",
    doi: "10.55632/pwvas.v97i1.1106",
    url: "https://doi.org/10.55632/pwvas.v97i1.1106",
  },
];

export const presentations: Publication[] = [
  {
    authors: ["Bhusal, T."],
    year: "2025",
    title: "Empowering industrial energy savings: Methods, tools, and impact of energy audits",
    venue: "WVU Pollution Prevention Conference, Morgantown, WV",
  },
  {
    authors: ["Bhusal, T."],
    year: "2024",
    title:
      "Electricity and natural gas consumption in West Virginia across residential, commercial, and industrial sectors",
    venue: "All Voices as One, West Virginia University",
  },
];

export const conferences = [
  { year: "2025", name: "AEE East Conference and Expo" },
  { year: "2023", name: "National Renewable Energy and Policy Symposium, EnergizeNepal, Kathmandu University" },
  { year: "2020", name: "National Mechanical Engineering Seminar, SOMAES" },
  { year: "2019", name: "National Mechanical Engineering Seminar, SOMAES" },
  { year: "2019", name: "National Young Scientists Conference, RECAST" },
];
