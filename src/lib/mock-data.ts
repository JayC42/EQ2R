/**
 * E2R — Mock Data for Development
 * Provides sample lessons and connections for the knowledge graph.
 */

import type { LessonNode, GraphEdge } from "../types";

export const MOCK_LESSONS: LessonNode[] = [
  {
    id: "lesson-1",
    principle_name: "Simple Harmonic Motion",
    observed_object: "Playground swing",
    levels: {
      child: {
        text: "You know how a swing goes back and forth? Once you get it going, it keeps swinging the same way over and over, like it remembers the path. It goes up on one side, slows down, then comes back the other way. It's like the swing is doing a little dance — the same dance every time!",
        transcript: "You know how a swing goes back and forth? Once you get it going, it keeps swinging the same way over and over, like it remembers the path. It goes up on one side, slows down, then comes back the other way. It's like the swing is doing a little dance, the same dance every time!"
      },
      teen: {
        text: "A swing is a classic example of a **pendulum**. When you pull it back and let go, **gravity** pulls it toward the center. But it overshoots because it has **momentum**, so it swings to the other side. The time it takes to complete one back-and-forth cycle is called the **period**, and amazingly, it stays roughly the same regardless of how high you swing (for small angles).",
        transcript: "A swing is a classic example of a pendulum. When you pull it back and let go, gravity pulls it toward the center. But it overshoots because it has momentum, so it swings to the other side. The time for one complete back-and-forth cycle is called the period, and it stays roughly the same regardless of how high you swing for small angles."
      },
      college: {
        text: "The swing behaves as a simple pendulum. The restoring torque is $\\\\tau = -mgL\\\\sin(\\\\theta)$. For small angles ($\\\\sin(\\\\theta) \\\\approx \\\\theta$), this yields SHM with period: $$T = 2\\\\pi\\\\sqrt{\\\\frac{L}{g}}$$",
        transcript: "The swing behaves as a simple pendulum. The restoring torque equals negative m g L sine theta. For small angles, sine theta is approximately equal to theta, which gives us simple harmonic motion with period T equals two pi times the square root of L over g."
      },
      grad: {
        text: "The small-angle approximation breaks down for amplitudes beyond ~15°. The exact period requires an elliptic integral: $T = 4\\\\sqrt{\\\\frac{L}{g}} K(\\\\sin^2(\\\\theta_0/2))$. Real swings also have damping from air resistance and pivot friction, introducing a decay envelope $e^{-\\\\gamma t}$.",
        transcript: "The small-angle approximation breaks down for amplitudes beyond about fifteen degrees. The exact period requires an elliptic integral of the first kind. Real swings also have damping from air resistance and pivot friction, introducing a decay envelope that goes as e to the negative gamma t."
      },
      expert: {
        text: "From a Lagrangian perspective, $\\\\mathcal{L} = \\\\frac{1}{2}mL^2\\\\dot{\\\\theta}^2 + mgL\\\\cos\\\\theta$. The pendulum maps onto the phase space of a nonlinear oscillator. It's topologically equivalent to flow on a cylinder, with the separatrix dividing libration from rotation. This connects to KAM theory and the onset of chaos in driven pendula.",
        transcript: "From a Lagrangian perspective, the Lagrangian equals one-half m L squared theta dot squared plus m g L cosine theta. The pendulum maps onto the phase space of a nonlinear oscillator. It is topologically equivalent to flow on a cylinder. This connects to KAM theory and the onset of chaos in driven pendula."
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
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a playground swing in mid-arc.",
    related_examples: ["Grandfather clock pendulum", "Wrecking ball", "Baby cradle rocking"],
    iconUrl: "",
    status: "completed",
    createdAt: "2026-03-07T10:00:00Z"
  },
  {
    id: "lesson-2",
    principle_name: "Projectile Motion",
    observed_object: "Basketball in mid-air",
    levels: {
      child: {
        text: "When you throw a basketball, it goes up, curves through the air, and comes back down. It's like the ball is drawing an invisible rainbow path in the sky! Gravity is always pulling it back down while it moves forward.",
        transcript: "When you throw a basketball, it goes up, curves through the air, and comes back down. It is like the ball is drawing an invisible rainbow path in the sky. Gravity is always pulling it back down while it moves forward."
      },
      teen: {
        text: "A basketball follows a curved path called a **parabola**. It has two independent motions: **horizontal** (constant speed, no forces) and **vertical** (accelerating downward due to **gravity** at 9.8 m/s²). The launch angle and speed determine how far and high it goes.",
        transcript: "A basketball follows a curved path called a parabola. It has two independent motions: horizontal at constant speed with no forces, and vertical accelerating downward due to gravity at nine point eight meters per second squared."
      },
      college: {
        text: "Ignoring air resistance, the trajectory is: $$y = x\\\\tan(\\\\theta) - \\\\frac{gx^2}{2v_0^2\\\\cos^2(\\\\theta)}$$ The **range** is maximized at $\\\\theta = 45°$.",
        transcript: "Ignoring air resistance, the trajectory follows a parabolic equation. The y position equals x times tangent theta minus g x squared over two v-naught squared cosine squared theta. The range is maximized at a launch angle of forty-five degrees."
      },
      grad: {
        text: "With air drag proportional to $v^2$, the equations of motion become coupled nonlinear ODEs without closed-form solutions. The Magnus effect from spin adds a lateral force $F \\\\propto \\\\omega \\\\times v$, explaining why a basketball curves.",
        transcript: "With air drag proportional to velocity squared, the equations of motion become coupled nonlinear ordinary differential equations without closed-form solutions. The Magnus effect from spin adds a lateral force, explaining why a basketball curves."
      },
      expert: {
        text: "The full treatment requires solving the Navier-Stokes equations around the ball to compute drag and lift coefficients as functions of Reynolds number. The transition from laminar to turbulent boundary layer (drag crisis) at $Re \\\\sim 10^5$ is critical for sports ball aerodynamics.",
        transcript: "The full treatment requires solving the Navier-Stokes equations around the ball to compute drag and lift coefficients as functions of Reynolds number. The transition from laminar to turbulent boundary layer at Reynolds number around ten to the fifth is critical for sports ball aerodynamics."
      }
    },
    primary_formula: "y = x\\\\tan(\\\\theta) - \\\\frac{gx^2}{2v_0^2\\\\cos^2(\\\\theta)}",
    formula_name: "Projectile Trajectory Equation",
    variable_definitions: {
      y: { name: "Vertical position", unit: "meters (m)", description: "Height of the projectile" },
      x: { name: "Horizontal position", unit: "meters (m)", description: "Range of the projectile" },
      "θ": { name: "Launch angle", unit: "degrees (°)", description: "Angle of launch above horizontal" },
      g: { name: "Gravitational acceleration", unit: "m/s²", description: "≈ 9.81 on Earth's surface" },
      "v₀": { name: "Initial velocity", unit: "m/s", description: "Speed at launch" }
    },
    graph_metadata_tags: ["ProjectileMotion", "GravitationalForce", "KineticEnergy", "Velocity", "Acceleration"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a basketball in a parabolic arc.",
    related_examples: ["Football pass", "Water fountain arc", "Cannonball"],
    iconUrl: "",
    status: "completed",
    createdAt: "2026-03-07T12:00:00Z"
  },
  {
    id: "lesson-3",
    principle_name: "Refraction of Light",
    observed_object: "Straw in a glass of water",
    levels: {
      child: {
        text: "Have you ever noticed a straw in a glass of water looks bent or broken? It's not really broken — the light plays a trick on your eyes! When light goes from air into water, it slows down and changes direction, making the straw look wonky.",
        transcript: "Have you ever noticed a straw in a glass of water looks bent or broken? It is not really broken. The light plays a trick on your eyes. When light goes from air into water, it slows down and changes direction, making the straw look wonky."
      },
      teen: {
        text: "Light travels at different **speeds** in different materials. In air, it's fast; in water, it's about 25% slower. When light crosses the boundary between air and water, it **bends** — this is called **refraction**. The amount of bending depends on the **refractive index** of each material.",
        transcript: "Light travels at different speeds in different materials. In air it is fast, in water it is about twenty-five percent slower. When light crosses the boundary between air and water, it bends. This is called refraction."
      },
      college: {
        text: "Snell's Law governs refraction: $$n_1 \\\\sin(\\\\theta_1) = n_2 \\\\sin(\\\\theta_2)$$ where $n$ is the refractive index. For air ($n \\\\approx 1.0$) to water ($n \\\\approx 1.33$), light bends toward the normal.",
        transcript: "Snell's Law governs refraction: n one times sine of theta one equals n two times sine of theta two. For air with refractive index approximately one to water with index approximately one point three three, light bends toward the normal."
      },
      grad: {
        text: "Snell's Law emerges from Fermat's principle of least time, or equivalently from matching the tangential component of the wave vector at the interface. Dispersion (wavelength-dependent $n$) leads to chromatic effects. Total internal reflection occurs at $\\\\theta_c = \\\\arcsin(n_2/n_1)$.",
        transcript: "Snell's Law emerges from Fermat's principle of least time, or equivalently from matching the tangential component of the wave vector at the interface. Total internal reflection occurs at the critical angle equal to arcsin of n two over n one."
      },
      expert: {
        text: "The Fresnel equations give the complete amplitude coefficients for reflected and transmitted waves as functions of angle and polarization. The refractive index is the real part of the complex permittivity: $\\\\tilde{n} = \\\\sqrt{\\\\epsilon_r \\\\mu_r}$. This connects to the Kramers-Kronig relations and anomalous dispersion near absorption lines.",
        transcript: "The Fresnel equations give complete amplitude coefficients for reflected and transmitted waves. The refractive index is the real part of the complex permittivity, n tilde equals the square root of epsilon r times mu r. This connects to the Kramers-Kronig relations."
      }
    },
    primary_formula: "n_1 \\\\sin(\\\\theta_1) = n_2 \\\\sin(\\\\theta_2)",
    formula_name: "Snell's Law of Refraction",
    variable_definitions: {
      "n₁": { name: "Refractive index (medium 1)", unit: "dimensionless", description: "≈ 1.0 for air" },
      "n₂": { name: "Refractive index (medium 2)", unit: "dimensionless", description: "≈ 1.33 for water" },
      "θ₁": { name: "Angle of incidence", unit: "radians", description: "Angle from normal in medium 1" },
      "θ₂": { name: "Angle of refraction", unit: "radians", description: "Angle from normal in medium 2" }
    },
    graph_metadata_tags: ["Refraction", "LightWave", "WaveMotion", "Optics"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a bent straw in a glass of water.",
    related_examples: ["Rainbow", "Eyeglasses lenses", "Mirage on hot road"],
    iconUrl: "",
    status: "completed",
    createdAt: "2026-03-07T14:00:00Z"
  },
  {
    id: "lesson-4",
    principle_name: "Electromagnetic Induction",
    observed_object: "Hand-crank flashlight",
    levels: {
      child: {
        text: "You know those flashlights you squeeze or crank to make them light up? When you crank the handle, you're spinning a magnet near a coil of wire. The spinning magnet creates electricity — it's like magic, but it's science! Your arm power becomes light power.",
        transcript: "You know those flashlights you squeeze or crank to make them light up? When you crank the handle, you are spinning a magnet near a coil of wire. The spinning magnet creates electricity. Your arm power becomes light power."
      },
      teen: {
        text: "A hand-crank flashlight uses **electromagnetic induction**. When you rotate a **magnet** near a coil of wire, the changing **magnetic field** pushes electrons through the wire, creating an **electric current**. The faster you crank, the more **voltage** you generate.",
        transcript: "A hand-crank flashlight uses electromagnetic induction. When you rotate a magnet near a coil of wire, the changing magnetic field pushes electrons through the wire, creating an electric current. The faster you crank, the more voltage you generate."
      },
      college: {
        text: "Faraday's Law: $$\\\\mathcal{E} = -\\\\frac{d\\\\Phi_B}{dt}$$ The induced EMF equals the negative rate of change of magnetic flux through the coil. For a coil of $N$ turns: $\\\\mathcal{E} = -N\\\\frac{d\\\\Phi_B}{dt}$.",
        transcript: "Faraday's Law states that the induced E M F equals the negative rate of change of magnetic flux through the coil. For a coil of N turns, the E M F equals negative N times the rate of change of magnetic flux."
      },
      grad: {
        text: "Faraday's Law is one of Maxwell's equations: $\\\\nabla \\\\times \\\\mathbf{E} = -\\\\frac{\\\\partial \\\\mathbf{B}}{\\\\partial t}$. The efficiency of energy conversion is limited by Ohmic losses ($I^2R$) in the coil, eddy currents in the core, and hysteresis losses in ferromagnetic materials.",
        transcript: "Faraday's Law in differential form states that the curl of the electric field equals the negative time derivative of the magnetic field. Efficiency is limited by Ohmic losses, eddy currents, and hysteresis losses."
      },
      expert: {
        text: "Electromagnetic induction is a consequence of gauge invariance in electrodynamics. The Aharonov-Bohm effect shows that the vector potential $\\\\mathbf{A}$ has physical significance beyond $\\\\mathbf{B} = \\\\nabla \\\\times \\\\mathbf{A}$. In the quantum realm, induction connects to Berry phase and geometric phase in parameter space.",
        transcript: "Electromagnetic induction is a consequence of gauge invariance in electrodynamics. The Aharonov-Bohm effect shows that the vector potential has physical significance beyond being the curl of A. In the quantum realm, induction connects to Berry phase and geometric phase."
      }
    },
    primary_formula: "\\\\mathcal{E} = -\\\\frac{d\\\\Phi_B}{dt}",
    formula_name: "Faraday's Law of Induction",
    variable_definitions: {
      "ε": { name: "Induced EMF", unit: "volts (V)", description: "Electromotive force generated" },
      "Φ_B": { name: "Magnetic flux", unit: "webers (Wb)", description: "B field times area" }
    },
    graph_metadata_tags: ["ElectromagneticInduction", "Faraday", "MagneticField", "ElectricCurrent"],
    nanobanana_icon_prompt: "A single minimalist flat 2D vector-style icon of a hand-crank flashlight.",
    related_examples: ["Electric guitar pickup", "Wireless phone charger", "Power plant generator"],
    iconUrl: "",
    status: "completed",
    createdAt: "2026-03-07T16:00:00Z"
  }
];

export const MOCK_CONNECTIONS: GraphEdge[] = [
  {
    id: "conn-1",
    sourceId: "lesson-1",
    targetId: "lesson-2",
    sharedTags: ["GravitationalForce", "KineticEnergy"],
    strength: 2
  },
  {
    id: "conn-2",
    sourceId: "lesson-1",
    targetId: "lesson-3",
    sharedTags: ["WaveMotion"],
    strength: 1
  },
  {
    id: "conn-3",
    sourceId: "lesson-2",
    targetId: "lesson-1",
    sharedTags: ["Velocity", "Acceleration"],
    strength: 2
  }
];
