/**
 * E2R — Domain Color Utility
 * Maps graph_metadata_tags to the Nano Banana color palette from the spec.
 */

export interface DomainColor {
  primary: string;
  accent: string;
  label: string;
}

// ─── Color Palette (from spec) ───────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, DomainColor> = {
  mechanics: { primary: "#4DB6AC", accent: "#FFB74D", label: "Mechanics / Motion" },
  thermo:    { primary: "#FF7043", accent: "#90A4AE", label: "Thermodynamics" },
  em:        { primary: "#5C6BC0", accent: "#FFEE58", label: "Electromagnetism" },
  waves:     { primary: "#26C6DA", accent: "#EF5350", label: "Waves / Optics" },
  quantum:   { primary: "#AB47BC", accent: "#C6FF00", label: "Quantum / Nuclear" },
};

const FALLBACK_COLOR: DomainColor = {
  primary: "#78909C",
  accent: "#B0BEC5",
  label: "General Physics",
};

// ─── Tag → Domain Keyword Map ────────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  mechanics: [
    "Motion", "Force", "Momentum", "Torque", "Friction", "Gravity", "Gravitational",
    "Kinetic", "Potential", "Velocity", "Acceleration", "Inertia", "Newton",
    "Harmonic", "Oscillation", "Pendulum", "Projectile", "Centripetal",
    "AngularMomentum", "Equilibrium", "Elasticity", "Collision", "Work", "Energy",
    "Pressure", "Buoyancy", "Fluid", "Viscosity", "Bernoulli", "Drag",
  ],
  thermo: [
    "Therm", "Heat", "Temperature", "Entropy", "Enthalpy", "Carnot",
    "Conduction", "Convection", "Radiation", "Boltzmann", "IdealGas",
    "PhaseTransition", "SpecificHeat", "Calorimetry",
  ],
  em: [
    "Electric", "Magnetic", "Electromagnetic", "Coulomb", "Ampere", "Faraday",
    "Maxwell", "Inductance", "Capacitance", "Resistance", "Circuit", "Current",
    "Voltage", "Charge", "Field", "Dipole", "Gauss", "Lorentz",
  ],
  waves: [
    "Wave", "Optic", "Light", "Sound", "Refraction", "Reflection", "Diffraction",
    "Interference", "Polarization", "Doppler", "Resonance", "Frequency",
    "Wavelength", "Amplitude", "Spectrum", "Laser", "Lens", "Mirror",
  ],
  quantum: [
    "Quantum", "Nuclear", "Atom", "Photon", "Electron", "Proton", "Neutron",
    "Spin", "Bohr", "Heisenberg", "Schrodinger", "Planck", "WaveFunction",
    "Tunneling", "Superposition", "Entanglement", "Fission", "Fusion",
    "Radioactive", "Decay", "Quark",
  ],
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Determine the physics domain from a set of graph_metadata_tags.
 * Returns the domain key that matches the most tags.
 */
export function detectDomain(tags: string[]): string {
  const scores: Record<string, number> = {};

  for (const tag of tags) {
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      for (const keyword of keywords) {
        if (tag.toLowerCase().includes(keyword.toLowerCase())) {
          scores[domain] = (scores[domain] || 0) + 1;
          break; // Only count one keyword match per tag per domain
        }
      }
    }
  }

  let bestDomain = "";
  let bestScore = 0;
  for (const [domain, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }

  return bestDomain || "general";
}

/**
 * Get the Nano Banana color palette for a set of tags.
 */
export function getDomainColor(tags: string[]): DomainColor {
  const domain = detectDomain(tags);
  return DOMAIN_COLORS[domain] || FALLBACK_COLOR;
}

/**
 * Get just the primary color hex for a set of tags.
 */
export function getNodeColor(tags: string[]): string {
  return getDomainColor(tags).primary;
}

/**
 * Get all available domain colors (for legend).
 */
export function getAllDomainColors(): Record<string, DomainColor> {
  return { ...DOMAIN_COLORS };
}
