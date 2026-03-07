/**
 * E2R — Seed Script
 * Inserts 5 sample lessons into Firestore with varied graph_metadata_tags
 * and runs graph chaining to create connections.
 *
 * Usage: npx ts-node --esm src/seed.ts <userId>
 * Or:    node -e "require('./lib/seed.js').seedData('USER_ID')"
 */

import * as admin from "firebase-admin";
import { chainKnowledgeNodes } from "./services/graph-chaining.js";
import type { LessonData } from "./types.js";

// Initialize Firebase Admin (uses default credentials / GOOGLE_APPLICATION_CREDENTIALS)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ─── Sample Lessons ──────────────────────────────────────────────────────────

const SEED_LESSONS: Omit<LessonData, "createdAt">[] = [
  {
    principle_name: "Simple Harmonic Motion",
    observed_object: "Playground pendulum",
    levels: {
      child: {
        text: "You know how a swing goes back and forth? Once you push it, it keeps swinging the same way over and over, like it remembers the path. It goes up on one side, slows down, then comes back the other way. The swing is doing a little dance!",
        transcript: "You know how a swing goes back and forth? Once you push it, it keeps swinging the same way over and over, like it remembers the path. It goes up on one side, slows down, then comes back the other way. The swing is doing a little dance!"
      },
      teen: {
        text: "A swing is a classic **pendulum**. When you pull it back and let go, **gravity** pulls it toward the center. But it overshoots because of **momentum**, swinging to the other side. The time for one full cycle is called the **period** and stays roughly constant for small swings.",
        transcript: "A swing is a classic pendulum. When you pull it back and let go, gravity pulls it toward the center. But it overshoots because of momentum, swinging to the other side. The time for one full cycle is called the period."
      },
      college: {
        text: "The swing behaves as a simple pendulum with restoring torque $\\\\tau = -mgL\\\\sin(\\\\theta)$. For small angles this yields SHM with period: $$T = 2\\\\pi\\\\sqrt{\\\\frac{L}{g}}$$",
        transcript: "The swing behaves as a simple pendulum. The restoring torque equals negative m g L sine theta. For small angles, this gives simple harmonic motion with period T equals two pi times the square root of L over g."
      },
      grad: {
        text: "The small-angle approximation breaks down beyond ~15°. The exact period requires an elliptic integral: $T = 4\\\\sqrt{\\\\frac{L}{g}} K(\\\\sin^2(\\\\theta_0/2))$. Real pendulums have damping from air resistance and pivot friction.",
        transcript: "The small-angle approximation breaks down beyond about fifteen degrees. The exact period requires an elliptic integral. Real pendulums have damping from air resistance and pivot friction."
      },
      expert: {
        text: "From the Lagrangian $\\\\mathcal{L} = \\\\frac{1}{2}mL^2\\\\dot{\\\\theta}^2 + mgL\\\\cos\\\\theta$, the pendulum maps onto a nonlinear oscillator's phase space. The separatrix divides libration from rotation, connecting to KAM theory.",
        transcript: "From the Lagrangian perspective, the pendulum maps onto a nonlinear oscillator phase space. The separatrix divides libration from rotation, connecting to KAM theory and the onset of chaos."
      }
    },
    primary_formula: "T = 2\\\\pi\\\\sqrt{\\\\frac{L}{g}}",
    formula_name: "Period of a Simple Pendulum",
    variable_definitions: {
      T: { name: "Period", unit: "seconds (s)", description: "Time for one complete swing cycle" },
      L: { name: "Length", unit: "meters (m)", description: "Distance from pivot to center of mass" },
      g: { name: "Gravitational acceleration", unit: "m/s²", description: "≈ 9.81 on Earth's surface" }
    },
    graph_metadata_tags: ["SimpleHarmonicMotion", "Oscillation", "GravitationalForce", "KineticEnergy", "PotentialEnergy"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a playground swing in mid-arc, viewed from the side. Drawn with simple geometric shapes: two straight lines for chains, a flat rectangle for the seat. Use teal #4DB6AC for the structure and amber #FFB74D for the seat. White background. No shadows, no gradients, no text. Suitable for a 64x64 pixel UI node icon.",
    related_examples: ["Grandfather clock pendulum", "Wrecking ball", "Baby cradle rocking"],
    iconUrl: "",
    status: "completed",
  },
  {
    principle_name: "Free Fall",
    observed_object: "Falling tennis ball",
    levels: {
      child: {
        text: "When you drop a ball, it falls straight down, faster and faster! The Earth is pulling it with an invisible force called gravity. Every object falls the same way — a bowling ball and a feather would fall together if there was no air.",
        transcript: "When you drop a ball, it falls straight down, faster and faster! The Earth is pulling it with an invisible force called gravity. Every object falls the same way if there is no air."
      },
      teen: {
        text: "A falling ball accelerates at **9.8 m/s²** due to **gravity**. This means every second it falls, it gains 9.8 m/s of speed. The distance it covers grows quadratically — it falls 4.9m in the first second, 19.6m in two seconds.",
        transcript: "A falling ball accelerates at nine point eight meters per second squared due to gravity. Every second it falls, it gains nine point eight meters per second of speed. The distance grows quadratically."
      },
      college: {
        text: "In free fall (neglecting drag), $y(t) = y_0 + v_0 t - \\\\frac{1}{2}gt^2$ and $v(t) = v_0 - gt$. Terminal velocity with drag: $v_t = \\\\sqrt{\\\\frac{2mg}{\\\\rho C_d A}}$.",
        transcript: "In free fall neglecting drag, the position y of t equals y naught plus v naught t minus one half g t squared. Terminal velocity with drag equals the square root of two m g over rho C d A."
      },
      grad: {
        text: "For high-velocity falls, drag $F_d = \\\\frac{1}{2}\\\\rho v^2 C_d A$ creates a coupled ODE. The drag coefficient $C_d$ depends on Reynolds number, and the transition to turbulence creates the drag crisis.",
        transcript: "For high-velocity falls, drag creates a coupled ordinary differential equation. The drag coefficient depends on Reynolds number, and the transition to turbulence creates the drag crisis."
      },
      expert: {
        text: "In general relativity, free fall follows geodesics of spacetime: $\\\\frac{d^2 x^\\\\mu}{d\\\\tau^2} + \\\\Gamma^\\\\mu_{\\\\nu\\\\rho} \\\\frac{dx^\\\\nu}{d\\\\tau} \\\\frac{dx^\\\\rho}{d\\\\tau} = 0$. The equivalence principle states that locally, gravity and acceleration are indistinguishable.",
        transcript: "In general relativity, free fall follows geodesics of spacetime described by the geodesic equation. The equivalence principle states that locally, gravity and acceleration are indistinguishable."
      }
    },
    primary_formula: "y = y_0 + v_0 t - \\\\frac{1}{2}gt^2",
    formula_name: "Kinematic Equation for Free Fall",
    variable_definitions: {
      y: { name: "Position", unit: "meters (m)", description: "Vertical position at time t" },
      y_0: { name: "Initial position", unit: "meters (m)", description: "Starting height" },
      v_0: { name: "Initial velocity", unit: "m/s", description: "Velocity at t=0" },
      g: { name: "Gravitational acceleration", unit: "m/s²", description: "≈ 9.81 m/s²" },
      t: { name: "Time", unit: "seconds (s)", description: "Elapsed time" }
    },
    graph_metadata_tags: ["FreeFall", "GravitationalForce", "Acceleration", "KineticEnergy"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a tennis ball falling downward with motion lines above it, viewed from the side. Drawn with a circle and short dashes. Use teal #4DB6AC for the ball and amber #FFB74D for the motion lines. White background. No shadows, no gradients, no text. Suitable for a 64x64 pixel UI node icon.",
    related_examples: ["Skydiving", "Dropping phone", "Galileo's tower experiment"],
    iconUrl: "",
    status: "completed",
  },
  {
    principle_name: "Phase Transition — Boiling",
    observed_object: "Pot of boiling water on a stove",
    levels: {
      child: {
        text: "When you heat water on the stove, it gets hotter and hotter until it starts bubbling like crazy! Those bubbles are water turning into steam. The water is changing from liquid to gas. It happens at a special temperature — 100 degrees Celsius.",
        transcript: "When you heat water on the stove, it gets hotter and hotter until it starts bubbling. Those bubbles are water turning into steam. The water is changing from liquid to gas at one hundred degrees Celsius."
      },
      teen: {
        text: "Boiling is a **phase transition** from liquid to gas. At **100°C** (at sea level), water molecules gain enough **kinetic energy** to break free from their liquid bonds. The **latent heat of vaporization** is the energy needed to convert liquid water to steam without raising temperature.",
        transcript: "Boiling is a phase transition from liquid to gas. At one hundred degrees Celsius at sea level, water molecules gain enough kinetic energy to break free from their liquid bonds. The latent heat is the energy needed to convert liquid to steam."
      },
      college: {
        text: "The Clausius-Clapeyron equation governs the boiling point: $$\\\\frac{dP}{dT} = \\\\frac{L}{T\\\\Delta v}$$ where $L$ is latent heat and $\\\\Delta v$ is the specific volume change. At 1 atm, water's $L_{vap} = 2260$ kJ/kg.",
        transcript: "The Clausius-Clapeyron equation governs the boiling point: d P over d T equals L over T times delta v, where L is latent heat and delta v is the specific volume change. At one atmosphere, water's latent heat is 2260 kilojoules per kilogram."
      },
      grad: {
        text: "Near the critical point (374°C, 22.1 MPa), the liquid-gas distinction vanishes. Critical exponents follow universality classes ($\\\\beta \\\\approx 0.326$ for 3D Ising). Nucleate boiling transitions to film boiling at the Leidenfrost point.",
        transcript: "Near the critical point at 374 degrees Celsius and 22.1 megapascals, the liquid-gas distinction vanishes. Critical exponents follow universality classes. Nucleate boiling transitions to film boiling at the Leidenfrost point."
      },
      expert: {
        text: "Phase transitions are classified by Ehrenfest: boiling is first-order (discontinuity in first derivative of free energy). The Gibbs free energy $G = H - TS$ determines equilibrium. Modern treatment uses Landau theory with order parameter $\\\\phi$ and $G \\\\sim a\\\\phi^2 + b\\\\phi^4$.",
        transcript: "Phase transitions are classified by Ehrenfest. Boiling is first-order with a discontinuity in the first derivative of free energy. The Gibbs free energy G equals H minus T S determines equilibrium. Modern treatment uses Landau theory with an order parameter."
      }
    },
    primary_formula: "\\\\frac{dP}{dT} = \\\\frac{L}{T\\\\Delta v}",
    formula_name: "Clausius-Clapeyron Equation",
    variable_definitions: {
      P: { name: "Pressure", unit: "Pa", description: "Vapor pressure" },
      T: { name: "Temperature", unit: "K", description: "Absolute temperature" },
      L: { name: "Latent heat", unit: "J/kg", description: "Energy per unit mass for phase transition" },
      "Δv": { name: "Specific volume change", unit: "m³/kg", description: "Volume difference between phases" }
    },
    graph_metadata_tags: ["PhaseTransition", "HeatTransfer", "SpecificHeat", "Thermodynamics"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a pot with steam bubbles rising from it, viewed from the side. Drawn with a trapezoid for the pot and small circles for bubbles. Use deep orange #FF7043 for the pot and cool gray #90A4AE for the steam. White background. No shadows, no gradients, no text. Suitable for a 64x64 pixel UI node icon.",
    related_examples: ["Ice melting", "Pressure cooker", "Evaporating puddle"],
    iconUrl: "",
    status: "completed",
  },
  {
    principle_name: "Refraction of Light",
    observed_object: "Straw in a glass of water",
    levels: {
      child: {
        text: "Have you noticed a straw in water looks bent? It's not broken — the light plays a trick! When light goes from air into water, it slows down and changes direction. This makes things look like they're in a different spot than they really are.",
        transcript: "Have you noticed a straw in water looks bent? It is not broken. The light plays a trick. When light goes from air into water, it slows down and changes direction. This makes things look like they are in a different spot."
      },
      teen: {
        text: "Light travels at different **speeds** in different materials. In air it's fast, in water about 25% slower. When light crosses the air-water boundary, it **bends** — this is **refraction**. The amount of bending depends on the **refractive index** of each material.",
        transcript: "Light travels at different speeds in different materials. In air it is fast, in water about twenty-five percent slower. When light crosses the air-water boundary, it bends. This is refraction."
      },
      college: {
        text: "Snell's Law: $$n_1 \\\\sin(\\\\theta_1) = n_2 \\\\sin(\\\\theta_2)$$ For air ($n \\\\approx 1.0$) to water ($n \\\\approx 1.33$), light bends toward the normal. Total internal reflection occurs at $\\\\theta_c = \\\\arcsin(n_2/n_1)$.",
        transcript: "Snell's Law states n one sine theta one equals n two sine theta two. For air to water, light bends toward the normal. Total internal reflection occurs at the critical angle."
      },
      grad: {
        text: "Snell's Law emerges from Fermat's principle of least time. Dispersion ($n(\\\\lambda)$) leads to chromatic effects. The Fresnel equations give reflection/transmission coefficients as functions of angle and polarization.",
        transcript: "Snell's Law emerges from Fermat's principle of least time. Dispersion leads to chromatic effects. The Fresnel equations give reflection and transmission coefficients as functions of angle and polarization."
      },
      expert: {
        text: "The refractive index is the real part of complex permittivity: $\\\\tilde{n} = \\\\sqrt{\\\\epsilon_r \\\\mu_r}$. Near absorption lines, anomalous dispersion occurs. The Kramers-Kronig relations connect real and imaginary parts of the response function.",
        transcript: "The refractive index is the real part of complex permittivity. Near absorption lines, anomalous dispersion occurs. The Kramers-Kronig relations connect real and imaginary parts of the response function."
      }
    },
    primary_formula: "n_1 \\\\sin(\\\\theta_1) = n_2 \\\\sin(\\\\theta_2)",
    formula_name: "Snell's Law",
    variable_definitions: {
      "n₁": { name: "Refractive index (medium 1)", unit: "dimensionless", description: "≈ 1.0 for air" },
      "n₂": { name: "Refractive index (medium 2)", unit: "dimensionless", description: "≈ 1.33 for water" },
      "θ₁": { name: "Angle of incidence", unit: "radians", description: "Angle from normal in medium 1" },
      "θ₂": { name: "Angle of refraction", unit: "radians", description: "Angle from normal in medium 2" }
    },
    graph_metadata_tags: ["Refraction", "LightWave", "WaveMotion", "Optics"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a bent straw in a glass of water, viewed from the side. Drawn with a rectangle for the glass and angled lines for the straw. Use cyan #26C6DA for the water and coral #EF5350 for the straw. White background. No shadows, no gradients, no text. Suitable for a 64x64 pixel UI node icon.",
    related_examples: ["Rainbow", "Eyeglasses lenses", "Mirage on hot road"],
    iconUrl: "",
    status: "completed",
  },
  {
    principle_name: "Gyroscopic Precession",
    observed_object: "Spinning top",
    levels: {
      child: {
        text: "A spinning top stays upright as long as it's spinning fast! When it starts to slow down, it wobbles around in circles before falling over. The faster it spins, the more it wants to stay standing. It's like the spin gives it a superpower to fight gravity.",
        transcript: "A spinning top stays upright as long as it is spinning fast. When it starts to slow down, it wobbles around in circles before falling over. The faster it spins, the more it wants to stay standing."
      },
      teen: {
        text: "A spinning top demonstrates **angular momentum** — a spinning object resists changes to its orientation. When gravity tries to tip it over, instead of falling, the top **precesses** — it traces a slow circle. The faster the spin, the slower and steadier the precession.",
        transcript: "A spinning top demonstrates angular momentum. A spinning object resists changes to its orientation. When gravity tries to tip it over, instead of falling, the top precesses, tracing a slow circle."
      },
      college: {
        text: "Precession rate: $$\\\\Omega_p = \\\\frac{mgr}{I\\\\omega}$$ where $I$ is the moment of inertia and $\\\\omega$ is the spin rate. The torque $\\\\tau = mgr\\\\sin\\\\theta$ causes the angular momentum vector to rotate horizontally.",
        transcript: "The precession rate omega p equals m g r over I omega, where I is the moment of inertia and omega is the spin rate. The gravitational torque causes the angular momentum vector to rotate horizontally."
      },
      grad: {
        text: "Full treatment requires Euler's equations: $I_1\\\\dot{\\\\omega}_1 - (I_2 - I_3)\\\\omega_2\\\\omega_3 = \\\\tau_1$ and cyclic permutations. Nutation (fast wobble superimposed on precession) arises from the interplay of torques and angular momentum components.",
        transcript: "Full treatment requires Euler's equations with cyclic permutations of the moment of inertia components. Nutation, a fast wobble superimposed on precession, arises from the interplay of torques and angular momentum."
      },
      expert: {
        text: "In Hamiltonian mechanics, the spinning top is an integrable system with three conserved quantities. The Euler angles $(\\\\phi, \\\\theta, \\\\psi)$ parameterize SO(3), and the motion lives on a 3-torus in phase space. Berry phase appears in the adiabatic limit.",
        transcript: "In Hamiltonian mechanics, the spinning top is an integrable system with three conserved quantities. The Euler angles parameterize SO three, and the motion lives on a three-torus in phase space. Berry phase appears in the adiabatic limit."
      }
    },
    primary_formula: "\\\\Omega_p = \\\\frac{mgr}{I\\\\omega}",
    formula_name: "Precession Rate of a Gyroscope",
    variable_definitions: {
      "Ω_p": { name: "Precession rate", unit: "rad/s", description: "Angular velocity of precession" },
      m: { name: "Mass", unit: "kg", description: "Mass of the top" },
      g: { name: "Gravitational acceleration", unit: "m/s²", description: "≈ 9.81 m/s²" },
      r: { name: "Distance to pivot", unit: "meters (m)", description: "Distance from pivot to center of mass" },
      I: { name: "Moment of inertia", unit: "kg·m²", description: "Rotational inertia about spin axis" },
      "ω": { name: "Spin rate", unit: "rad/s", description: "Angular velocity of spin" }
    },
    graph_metadata_tags: ["AngularMomentum", "Torque", "GravitationalForce", "RotationalMotion"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a spinning top in motion with a small circular arrow indicating rotation, viewed from the side. Drawn with a triangle and a line for the axis. Use teal #4DB6AC for the top and amber #FFB74D for the rotation arrow. White background. No shadows, no gradients, no text. Suitable for a 64x64 pixel UI node icon.",
    related_examples: ["Bicycle wheel gyroscope", "Earth's axial precession", "Fidget spinner"],
    iconUrl: "",
    status: "completed",
  },
];

// ─── Seed Function ───────────────────────────────────────────────────────────

export async function seedData(userId: string): Promise<void> {
  console.log(`\n🌱 Seeding E2R data for user: ${userId}\n`);

  const lessonsRef = db.collection("users").doc(userId).collection("lessons");
  const createdIds: string[] = [];

  // 1. Insert all lessons
  for (const lesson of SEED_LESSONS) {
    const docRef = lessonsRef.doc();
    const lessonData: LessonData = {
      ...lesson,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.set(lessonData);
    createdIds.push(docRef.id);
    console.log(`  ✅ Created lesson: ${lesson.principle_name} (${docRef.id})`);
  }

  // 2. Run graph chaining for each lesson
  console.log(`\n🔗 Running graph chaining...\n`);
  let totalConnections = 0;

  for (let i = 0; i < createdIds.length; i++) {
    const lessonDoc = await lessonsRef.doc(createdIds[i]).get();
    const lessonData = lessonDoc.data() as LessonData;

    const connections = await chainKnowledgeNodes(userId, lessonData, createdIds[i]);
    totalConnections += connections.length;

    if (connections.length > 0) {
      console.log(`  🔗 ${SEED_LESSONS[i].principle_name} → ${connections.length} connection(s)`);
      for (const conn of connections) {
        console.log(`     ↳ Shared tags: [${conn.sharedTags.join(", ")}] (strength: ${conn.strength})`);
      }
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Lessons: ${createdIds.length}`);
  console.log(`   Connections: ${totalConnections}\n`);
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length > 0) {
  const userId = args[0];
  seedData(userId)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
