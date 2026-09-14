export interface AeroProject {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  tagline: string;
  description: string;
  specs: {
    wingspan: string;
    aspectRatio: string;
    maxMach: string;
    liftToDrag: string;
    reynoldsNum: string;
    mass: string;
  };
  cfdDetails: {
    solver: string;
    meshCells: string;
    turbulenceModel: string;
    keyFinding: string;
  };
  modelType: 'waverider' | 'bwb' | 'glider' | 'airfoil' | 'aerobot' | 'airliner' | 'cfd_wing' | 'turbofan' | 'rover' | 'satellite' | 'kestrel' | 'first_flight' | 'reaper_drone' | 'paper_plane';
  modelPath?: string;
  pressurePeak: string;
  tags: string[];
  color: string;
  accentColor: string;
}

export interface AerospaceTool {
  name: string;
  category: string;
  proficiency: string;
  badge: string;
  metric: string;
  iconName: string;
}

export interface EvolutionStage {
  id: string;
  era: string;
  title: string;
  period: string;
  flowType: 'turbulent' | 'chaotic' | 'rough' | 'laminar';
  description: string;
  speed: string;
  reynolds: string;
  narrative: string;
  modelPath?: string;
  modelScale?: number;
  modelRotY?: number;
}

export const AEROSPACE_DATA = {
  pilot: {
    name: "DHANESHKUMAR S",
    callsign: "AERO-VIT",
    classification: "Aerospace Engineering Student",
    title: "Aerospace Engineering Student",
    headline: "Turning Ideas into Flight",
    bio: "I'm an aerospace engineering student passionate about designing, building and exploring the skies — from CAD models to UAVs, and beyond.",
    aboutGreeting: "Hello, I'm Dhaneshkumar S",
    aboutDescription: "I'm a first-year Aerospace Engineering student at VIT Bhopal, with a passion for aircraft design, simulation, and building real-world solutions. I love turning complex problems into simple, functional designs — whether it's a 3D model, a simulation, or a full system.",
    university: "VIT Bhopal",
    institution: "Department of Aerospace Engineering, VIT Bhopal",
    location: "India",
    email: "dhaneshkumarvit@gmail.com",
    behance: "https://www.behance.net/dhaneshkumars",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    stats: [
      { value: "1+", label: "Years of Learning" },
      { value: "10+", label: "Projects & Models" },
      { value: "100%", label: "Curiosity & Growth Mindset" },
    ],
    heroBadges: [
      { title: "VIT Bhopal", subtitle: "University", icon: "GraduationCap" },
      { title: "Aerospace", subtitle: "Engineering", icon: "Plane" },
      { title: "Fusion 360", subtitle: "3D CAD", icon: "Box" },
      { title: "UAV Design", subtitle: "Modeling & Simulation", icon: "Compass" },
    ],
  },

  tools: [
    {
      name: "SolidWorks",
      category: "CAD & 3D Modeling",
      proficiency: "95%",
      badge: "Parametric Master",
      metric: "Complex lofts, aerofoil splines, generative surfaces",
      iconName: "Box",
    },
    {
      name: "Fusion 360",
      category: "CAD & 3D Modeling",
      proficiency: "92%",
      badge: "Aerospace Modeling",
      metric: "Generative Design, UAV chassis & parametric components",
      iconName: "Layers",
    },
    {
      name: "ANSYS Fluent",
      category: "CFD & Flow Simulation",
      proficiency: "88%",
      badge: "Core CFD Engine",
      metric: "Compressible flow, polyhedral meshing, k-ω SST turbulence",
      iconName: "Wind",
    },
    {
      name: "OpenFOAM",
      category: "CFD & Flow Simulation",
      proficiency: "82%",
      badge: "Open-Source Solvers",
      metric: "SnappyHexMesh, simpleFoam & aerodynamic polars",
      iconName: "Terminal",
    },
  ] as AerospaceTool[],

  hudTelemetry: {
    lift: "+ 1.32",
    drag: "0.21",
    aoa: "3.5°",
    motto: "BETTER DESIGN SAFER SKIES",
    status: "FLIGHT ENVELOPE NORMAL",
  },

  experience: [
    {
      role: "Aerospace Design Intern",
      organization: "VIT Bhopal",
      duration: "Aug 2024 - Feb 2025",
      type: "Research & Design",
      highlight: "Aerodynamic surface optimization & wind tunnel wing models.",
    },
    {
      role: "Design Intern",
      organization: "EZY | Health",
      duration: "Jun 2024 - Aug 2025",
      type: "Product & UX Design",
      highlight: "Ergonomic CAD modeling and component prototyping.",
    },
    {
      role: "Graphic Design & Social Media Intern",
      organization: "Creative Tech Hub",
      duration: "Jun 2024 - Aug 2025",
      type: "Visual Communications",
      highlight: "Technical illustration and engineering infographics.",
    },
    {
      role: "Freelance Designer",
      organization: "Independent",
      duration: "2023 - Present",
      type: "Aerospace & 3D CAD",
      highlight: "Parametric 3D CAD modeling, 3D printing preparation & renders.",
    },
  ],

  skills: [
    { name: "CAD (SolidWorks)", level: "Advanced" },
    { name: "3D Modelling", level: "Expert" },
    { name: "CFD & Simulation", level: "Intermediate" },
    { name: "Python", level: "Intermediate" },
    { name: "JavaScript", level: "Intermediate" },
    { name: "Web Development", level: "Proficient" },
    { name: "Aerospace Design", level: "Core Major" },
    { name: "Problem Solving", level: "Core Mindset" },
  ],

  projects: [
    {
      id: "aircraft-design",
      number: "01",
      title: "Aircraft Design",
      subtitle: "3D models & aerodynamic analysis",
      category: "Aeronautics Study",
      tagline: "High-lift wing geometry with computational pressure contours",
      description: "Interactive aerodynamic study model exploring high-lift wing geometries, winglet vortex diffusion, and parametric fuselage contours in CAD to understand induced drag reduction.",
      specs: {
        wingspan: "14.2 m (Study Model)",
        aspectRatio: "8.6 AR Study",
        maxMach: "Mach 0.84 Target",
        liftToDrag: "18.4 L/D Simulated",
        reynoldsNum: "6.5 × 10⁶ Domain",
        mass: "Reference Class",
      },
      cfdDetails: {
        solver: "ANSYS Fluent & OpenFOAM (Study)",
        meshCells: "4.2M Hex-dominant Grid",
        turbulenceModel: "k-ω SST Model",
        keyFinding: "Modeled raked wingtips indicating ~14% induced drag reduction across cruise angles of attack.",
      },
      modelType: "glider",
      modelPath: "/models/paper_plane/scene.gltf",
      pressurePeak: "Cp_min = -1.65 (Leading Edge Suction)",
      tags: ["3D CAD", "Aerodynamics", "SolidWorks", "CFD Study"],
      color: "#2563eb",
      accentColor: "#60a5fa",
    },
    {
      id: "simulation",
      number: "02",
      title: "Simulation",
      subtitle: "CFD & structural analysis",
      category: "Computational Study",
      tagline: "Pressure mapped boundary layers and flow visualization",
      description: "Computational fluid dynamics demonstration resolving boundary layer separation, stagnation points, and chordwise pressure distribution gradients across varied angles of attack.",
      specs: {
        wingspan: "Unit Span Airfoil",
        aspectRatio: "2D Section Study",
        maxMach: "Mach 0.78 Domain",
        liftToDrag: "36.2 Polar Peak",
        reynoldsNum: "3.8 × 10⁶ Test",
        mass: "Analytical Domain",
      },
      cfdDetails: {
        solver: "OpenFOAM simpleFoam Demo",
        meshCells: "850,000 Polyhedral Mesh",
        turbulenceModel: "Spalart-Allmaras 1-Eq",
        keyFinding: "Simulated laminar drag bucket characteristics across α = 1.5° to 5.0° incidence.",
      },
      modelType: "cfd_wing",
      pressurePeak: "Stagnation P0 = 101.3 kPa",
      tags: ["CFD Simulation", "OpenFOAM", "ANSYS", "Finite Element"],
      color: "#d97706",
      accentColor: "#fbbf24",
    },
    {
      id: "3d-models",
      number: "03",
      title: "3D Models",
      subtitle: "CAD & product design",
      category: "Propulsion CAD",
      tagline: "High-bypass turbofan assembly and mechanical kinematics",
      description: "Parametric multi-stage compressor and turbine CAD model demonstrating 3D contoured rotor blades, variable stator rings, and nacelle cowlings created in Fusion 360.",
      specs: {
        wingspan: "Fan Dia: 1.85 m",
        aspectRatio: "Bypass Ratio: 9:1",
        maxMach: "Tip M 1.15 Target",
        liftToDrag: "Thrust Vector Study",
        reynoldsNum: "Turbulent Domain",
        mass: "CAD Digital Twin",
      },
      cfdDetails: {
        solver: "MRF Rotating Domain Study",
        meshCells: "6.1M Sliding Mesh",
        turbulenceModel: "k-ε Realizable",
        keyFinding: "Designed swept fan blade tip geometry to study acoustic shock containment.",
      },
      modelType: "turbofan",
      pressurePeak: "Pressure Ratio = 28:1 Target",
      tags: ["Fusion 360", "SolidWorks", "Turbomachinery", "3D Printing"],
      color: "#16a34a",
      accentColor: "#4ade80",
    },
    {
      id: "engineering-systems",
      number: "04",
      title: "Engineering Systems",
      subtitle: "Embedded & automation",
      category: "Autonomous Systems",
      tagline: "Telemetry avionics & autonomous rover chassis prototype",
      description: "Autonomous exploration robotics study exploring rocker-bogie kinematic geometry, IMU inertial navigation, ultrasonic distance arrays, and onboard sensor telemetry logging.",
      specs: {
        wingspan: "Chassis: 65 × 48 cm",
        aspectRatio: "6WD Rocker-Bogie",
        maxMach: "Ground: 2.2 m/s",
        liftToDrag: "Payload: 12 kg Capacity",
        reynoldsNum: "Ground Robotics",
        mass: "8.4 kg Prototype",
      },
      cfdDetails: {
        solver: "Kinematic Dynamic Analysis",
        meshCells: "Multibody Kinematics",
        turbulenceModel: "Internal Heat Dissipation",
        keyFinding: "Low center-of-gravity architecture preventing roll-over up to 38° slope inclination.",
      },
      modelType: "rover",
      pressurePeak: "Thermal Heat Flux: 45 W",
      tags: ["Embedded Systems", "Robotics", "Arduino / ESP32", "Automation"],
      color: "#ea580c",
      accentColor: "#fb923c",
    },
    {
      id: "future-projects",
      number: "05",
      title: "Future Projects",
      subtitle: "More ideas, more flight",
      category: "Space Systems Study",
      tagline: "CubeSat orbital mechanics & deployable array concepts",
      description: "Conceptual 3U CubeSat structural model exploring passive magnetic stabilization, deployable solar panel hinges, and low-Earth orbit aerodynamic drag decay calculations.",
      specs: {
        wingspan: "Deployed: 1.2 m",
        aspectRatio: "3U Standard CubeSat",
        maxMach: "Orbital: 7.8 km/s LEO",
        liftToDrag: "Orbital Aerodynamics",
        reynoldsNum: "Rarefied Flow Regime",
        mass: "3.6 kg Envelope",
      },
      cfdDetails: {
        solver: "Rarefied Gas Dynamics (DSMC)",
        meshCells: "Orbital Particle Domain",
        turbulenceModel: "Free Molecular Flow",
        keyFinding: "Explored aerodynamic stability geometries to passively align vehicle along velocity vector.",
      },
      modelType: "satellite",
      pressurePeak: "Solar Radiation Pressure Study",
      tags: ["Space Systems", "CubeSat", "Orbital Mechanics", "Conceptual CAD"],
      color: "#7c3aed",
      accentColor: "#a78bfa",
    },
  ] as AeroProject[],

  evolutionStages: [
    {
      id: "stage-bird",
      era: "NATURE'S FLIGHT",
      title: "American Kestrel",
      period: "Prehistoric — Nature's Masterpiece",
      flowType: "turbulent",
      description: "Biological flight with adaptive leading-edge feathers, morphing wing camber, and organic vortex shedding.",
      speed: "18 - 32 m/s",
      reynolds: "Re ~ 1.2 × 10⁵",
      narrative: "Alive, organic, slightly unpredictable — nature's flight is adaptive, adjusting instantaneously to turbulent thermal updrafts.",
      modelPath: "/models/kestrel/scene.gltf",
      modelScale: 0.7,
      modelRotY: 0.4,
    },
    {
      id: "stage-davinci",
      era: "THE SKETCH ERA",
      title: "da Vinci Ornithopter",
      period: "c. 1485 — Mechanical Curiosity",
      flowType: "chaotic",
      description: "Early conceptual attempts to reproduce avian kinematics through wooden spars, pulleys, and linen flaps.",
      speed: "Theoretical",
      reynolds: "Unresolved",
      narrative: "Guesswork, unresolved, pre-scientific — flow direction changes sharply with high roughness, simulating mankind's first daring aerodynamic intuition.",
      modelPath: undefined,
    },
    {
      id: "stage-wright",
      era: "FIRST POWERED FLIGHT",
      title: "Wright Flyer 1903",
      period: "December 17, 1903 — Kitty Hawk",
      flowType: "rough",
      description: "The historic biplane with wooden struts, wing-warping lateral control, and twin counter-rotating pusher propellers.",
      speed: "13.4 m/s (30 mph)",
      reynolds: "Re ~ 1.8 × 10⁶",
      narrative: "First real engineering — directional flow over stacked biplane airfoils with visible turbulence around wing struts, purposeful and repeatable.",
      modelPath: "/models/first_flight/scene.gltf",
      modelScale: 0.5,
      modelRotY: 0.2,
    },
    {
      id: "stage-modern",
      era: "MODERN AUTONOMOUS AERO",
      title: "MQ-9 Reaper Drone",
      period: "2020s — High-Altitude Precision",
      flowType: "laminar",
      description: "Ultra-high aspect ratio composite wings, laminar boundary layer suction, fly-by-wire avionics, and low-drag V-tail.",
      speed: "130 m/s (Mach 0.38)",
      reynolds: "Re ~ 8.5 × 10⁶",
      narrative: "Precision, simulation, and CFD control — silky laminar streamlines with hero airflow curling over the composite fuselage.",
      modelPath: "/models/reaper_drone/scene.gltf",
      modelScale: 0.35,
      modelRotY: -0.3,
    },
  ] as EvolutionStage[],

  roadmap: [
    {
      id: "rm-1",
      title: "VIT Bhopal",
      subtitle: "B.Tech Aerospace Eng.",
      period: "2023 - 2027",
      icon: "GraduationCap",
      desc: "Aerodynamics, flight mechanics, propulsion and structural fundamentals.",
    },
    {
      id: "rm-2",
      title: "Internships",
      subtitle: "Real-world experience",
      period: "2024 - 2025",
      icon: "Briefcase",
      desc: "Aerospace design, CAD engineering, prototyping, and industry-grade CFD analysis.",
    },
    {
      id: "rm-3",
      title: "Projects",
      subtitle: "Design • Build • Test",
      period: "2023 - Present",
      icon: "Box",
      desc: "RC models, drone frames, wind tunnel specimens, and embedded avionics.",
    },
    {
      id: "rm-4",
      title: "Goals",
      subtitle: "UAVs • Space • Innovation",
      period: "Next",
      icon: "Rocket",
      desc: "Advanced aerospace research, autonomous UAV swarms, and space vehicle systems.",
    },
  ],
};
