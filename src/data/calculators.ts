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
    title: "Boiler Blowdown Heat Recovery Sizer",
    description: "Balance boiler TDS, recover flash steam and residual heat, size the exchanger, and explore fuel savings and 10-year project returns.",
    href: "/boiler-blowdown-recovery/",
    category: "Steam Systems & Heat Recovery",
    features: ["SI & Imperial", "Thermal sizing", "PDF report"],
  },
  {
    title: "Power Factor Correction & Demand Optimizer",
    description: "Size reactive compensation, explore harmonic filtering, recover transformer capacity, and estimate demand-charge and feeder-loss savings.",
    href: "/power-factor-optimizer/",
    category: "Electrical Systems & Power Quality",
    features: ["kVAR sizing", "Tariff comparison", "PDF report"],
  },
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
