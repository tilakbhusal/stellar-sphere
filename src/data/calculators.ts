export interface Calculator {
  title: string;
  description: string;
  href: string;
  category: string;
  features: string[];
}

// Add one entry here for each calculator page you publish.
export const calculators: Calculator[] = [
  {
    title: "Pump & Fan Affinity Laws Calculator",
    description: "Model changes in speed and impeller diameter, explore system operating points, and estimate annual VFD energy savings.",
    href: "/pump-affinity-calculator/",
    category: "Pumps, Fans & Energy Efficiency",
    features: ["Interactive curves", "Custom exponents", "PDF report"],
  },
  {
    title: "Psychrometric Calculator",
    description:
      "Explore the properties of moist air. Calculate humidity, wet-bulb temperature, dew point, and enthalpy with an interactive psychrometric chart.",
    href: "/psychrometric-calculator",
    category: "HVAC & Air Properties",
    features: ["SI & Imperial", "Altitude correction", "Interactive chart"],
  },
];
