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
    title: "Psychrometric Calculator",
    description:
      "Explore the properties of moist air. Calculate humidity, wet-bulb temperature, dew point, and enthalpy with an interactive psychrometric chart.",
    href: "/psychrometric-calculator",
    category: "HVAC & Air Properties",
    features: ["SI & Imperial", "Altitude correction", "Interactive chart"],
  },
];
