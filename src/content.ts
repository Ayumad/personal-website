export type SectionId =
  | "home"
  | "about"
  | "projects"
  | "homelab"
  | "audio"
  | "notes"
  | "photography"
  | "gaming"
  | "now"
  | "gear"
  | "resume"
  | "contact"
  | "aiush";

export type BedroomItemKind =
  | "computer"
  | "bass"
  | "tv"
  | "bed"
  | "server"
  | "notebook"
  | "camera"
  | "whiteboard"
  | "shelf"
  | "mail"
  | "poster"
  | "plant";

export interface PanelCard {
  title: string;
  meta?: string;
  text: string;
}

export interface PanelLink {
  label: string;
  section: SectionId;
}

export interface SiteSection {
  id: SectionId;
  navLabel: string;
  command: string;
  eyebrow: string;
  title: string;
  intro: string;
  paragraphs: string[];
  highlights: string[];
  cards?: PanelCard[];
  links?: PanelLink[];
  accent: string;
}

export interface BedroomItem {
  id: string;
  section: SectionId;
  kind: BedroomItemKind;
  label: string;
  command: string;
  inspect: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent: string;
}

export const primaryNav: SectionId[] = ["home", "projects", "about", "now", "resume", "contact"];

export const bedroomItems: BedroomItem[] = [
  {
    id: "computer-terminal",
    section: "home",
    kind: "computer",
    label: "Computer desk",
    command: "help",
    inspect:
      "The PC is humming. Projects, notes, local AI experiments, and half-finished ideas are open everywhere.",
    x: 5,
    y: 1,
    w: 3,
    h: 3,
    accent: "#6ed7d8"
  },
  {
    id: "bass-guitar",
    section: "audio",
    kind: "bass",
    label: "Bass guitar",
    command: "audio",
    inspect:
      "A bass guitar rests on its stand. Warm tuning, deep sub-bass, and audio rabbit holes live here.",
    x: 1,
    y: 2,
    w: 1,
    h: 3,
    accent: "#e2b35f"
  },
  {
    id: "tv-console",
    section: "gaming",
    kind: "tv",
    label: "TV and game console",
    command: "gaming",
    inspect:
      "The console is plugged in. Current save file: PC gaming, handhelds, VR, and old tech.",
    x: 11,
    y: 2,
    w: 3,
    h: 2,
    accent: "#7ca7ff"
  },
  {
    id: "bed",
    section: "about",
    kind: "bed",
    label: "Bed and nightstand",
    command: "about",
    inspect:
      "A lived-in bed. Somehow there are still project ideas on the pillow.",
    x: 1,
    y: 5,
    w: 3,
    h: 4,
    accent: "#f28f82"
  },
  {
    id: "server-stack",
    section: "homelab",
    kind: "server",
    label: "Mini server stack",
    command: "homelab",
    inspect:
      "Tiny blinking servers. Proxmox, storage plans, dashboards, local AI, and self-hosted experiments.",
    x: 8,
    y: 1,
    w: 2,
    h: 3,
    accent: "#87c779"
  },
  {
    id: "obsidian-notebook",
    section: "notes",
    kind: "notebook",
    label: "Open notebook",
    command: "notes",
    inspect:
      "An open notebook full of Obsidian links, project maps, hardware notes, and second-brain plans.",
    x: 6,
    y: 5,
    w: 2,
    h: 1,
    accent: "#a991f2"
  },
  {
    id: "camera",
    section: "photography",
    kind: "camera",
    label: "Camera shelf",
    command: "photo",
    inspect:
      "A camera sits beside small keepsakes. Future gallery: setups, places, devices, and experiments.",
    x: 1,
    y: 1,
    w: 2,
    h: 2,
    accent: "#f27fa5"
  },
  {
    id: "now-board",
    section: "now",
    kind: "whiteboard",
    label: "Now board",
    command: "now",
    inspect:
      "Sticky notes track the current quests: pixel room polish, local AI, homelab, and audio notes.",
    x: 10,
    y: 1,
    w: 2,
    h: 2,
    accent: "#e8cf6a"
  },
  {
    id: "gear-shelf",
    section: "gear",
    kind: "shelf",
    label: "Gear shelf",
    command: "gear",
    inspect:
      "The shelf holds PC parts, audio gear, cameras, cables, and the tools that make everything possible.",
    x: 11,
    y: 6,
    w: 3,
    h: 2,
    accent: "#d99c71"
  },
  {
    id: "mail-crate",
    section: "contact",
    kind: "mail",
    label: "Mail crate",
    command: "contact",
    inspect:
      "A small mail crate for contact links, GitHub, LinkedIn, and a resume PDF once they are wired up.",
    x: 13,
    y: 8,
    w: 1,
    h: 1,
    accent: "#ff9d70"
  },
  {
    id: "project-poster",
    section: "projects",
    kind: "poster",
    label: "Project poster wall",
    command: "projects",
    inspect:
      "Posters for Owlbot, DeluluBot, audio visualization, homelab, and this website.",
    x: 3,
    y: 1,
    w: 2,
    h: 2,
    accent: "#6ed7d8"
  },
  {
    id: "ai-plant",
    section: "aiush",
    kind: "plant",
    label: "AI-ush desk plant",
    command: "aiush",
    inspect:
      "A slightly suspicious plant marks AI-ush: a future personal assistant idea, not a chatbot yet.",
    x: 13,
    y: 4,
    w: 1,
    h: 2,
    accent: "#78d5a2"
  }
];

export const sections: Record<SectionId, SiteSection> = {
  home: {
    id: "home",
    navLabel: "Home",
    command: "home",
    eyebrow: "ayumad.me",
    title: "Welcome to Ayush's room.",
    intro:
      "This is a Game Boy Advance-style bedroom interface for exploring who I am, what I build, and what I keep coming back to.",
    paragraphs: [
      "V1 is focused on making the room feel right first: a small playable space with objects that say something about my interests.",
      "The bedroom is meant to feel lived in: music gear, a computer, a TV and console, a bed, notes, shelves, hardware, and little clues about my interests."
    ],
    highlights: [
      "Move with WASD or arrow keys",
      "Press Z or Enter near objects to inspect them",
      "Click or tap objects directly on touch screens"
    ],
    links: [
      { label: "Projects", section: "projects" },
      { label: "About", section: "about" },
      { label: "Now", section: "now" }
    ],
    accent: "#6ed7d8"
  },
  about: {
    id: "about",
    navLabel: "About",
    command: "about",
    eyebrow: "Who I am",
    title: "I like systems that are personal, modular, and expressive.",
    intro:
      "I am Ayush Madhukar, a Computer Engineering student in the Bay Area interested in AI, hardware, audio, self-hosting, and personal knowledge systems.",
    paragraphs: [
      "When I get into something, I usually want to understand the stack underneath it. AI tools lead me into model sizes, hardware needs, RAG, local inference, and notes. Audio leads me into DACs, amps, tuning, pads, EQ, soundstage, and why one chain feels better than another.",
      "A lot of my interests come back to the same pattern: I like tools that can be shaped around how I think. I am especially interested in technology that becomes useful, contextual, and human instead of just flashy."
    ],
    highlights: [
      "Based in the Bay Area / Fremont, California",
      "Bachelor's in Computer Engineering in progress at San Jose State University",
      "Associate's in Computer Science from Foothill College",
      "Curious about the human side of technology, not only the specs"
    ],
    links: [
      { label: "Projects", section: "projects" },
      { label: "Gear", section: "gear" }
    ],
    accent: "#f28f82"
  },
  projects: {
    id: "projects",
    navLabel: "Projects",
    command: "projects",
    eyebrow: "Selected work",
    title: "Projects that make abstract systems interactive.",
    intro:
      "The common thread across my projects is using technology to make data, sound, emotion, knowledge, and communication easier to interact with.",
    paragraphs: [
      "This area should grow into project writeups with screenshots, demos, stack notes, and lessons learned. V1 starts with the project map."
    ],
    highlights: [
      "AI for student communication and support",
      "Audio visualization, cymatics, and music-emotion research",
      "Community workshops, hackathons, and emerging technology education"
    ],
    cards: [
      {
        title: "Owlbot",
        meta: "Generative campus assistant",
        text: "A chatbot for Foothill College designed to support campus-wide student communication."
      },
      {
        title: "DeluluBot",
        meta: "CalHacks 10.0",
        text: "An AI bot that recognizes and responds to human emotion through voice analysis."
      },
      {
        title: "Audio Visualization Project",
        meta: "Chladni, sound, ML",
        text: "A project around Chladni plate simulation, sound visualization, machine learning, and music-emotion research."
      },
      {
        title: "Personal Website",
        meta: "Pixel bedroom",
        text: "This site itself: a Game Boy Advance-style personal room for projects, notes, interests, and experiments."
      }
    ],
    links: [
      { label: "Homelab", section: "homelab" },
      { label: "AI-ush", section: "aiush" }
    ],
    accent: "#6ed7d8"
  },
  homelab: {
    id: "homelab",
    navLabel: "Homelab",
    command: "homelab",
    eyebrow: "Self-hosted systems",
    title: "Owning more of my digital life, one server experiment at a time.",
    intro:
      "My homelab is where older hardware, storage planning, GPUs, Proxmox, media, games, dashboards, and local AI turn into a real learning environment.",
    paragraphs: [
      "I am interested in the practical side of infrastructure: storage layout, backups, virtualization, networking, containers, acceleration, and how all of it fits together.",
      "Long term, I want the homelab to connect with notes, media, AI tools, automation, and this website."
    ],
    highlights: [
      "Proxmox and self-hosted services",
      "Jellyfin, Minecraft hosting, dashboards, and backups",
      "Local AI experiments and GPU planning",
      "Obsidian plus automation workflows"
    ],
    accent: "#87c779"
  },
  audio: {
    id: "audio",
    navLabel: "Audio",
    command: "audio",
    eyebrow: "Bass, headphones, sound",
    title: "Audio sits between physics, perception, hardware, emotion, and art.",
    intro:
      "I am into bass guitar, headphones, IEMs, DACs, amps, speakers, subwoofers, and how each part of the chain changes the listening experience.",
    paragraphs: [
      "I tend to prefer warmer tuning with deep sub-bass, but I also like comparing gear to understand why different setups feel the way they do.",
      "Audio also connects back to my engineering work through sound visualization, Chladni simulations, cymatics, and AI-generated music research."
    ],
    highlights: [
      "Bass guitar, headphones, IEMs, speakers, DACs, amps, and room correction",
      "Warm tuning, sub-bass, soundstage, detail, and presentation",
      "FL Studio, Ableton, Audacity, and music technology experiments"
    ],
    accent: "#e2b35f"
  },
  notes: {
    id: "notes",
    navLabel: "Notes",
    command: "notes",
    eyebrow: "Knowledge system",
    title: "A public layer for the things I am learning.",
    intro:
      "I use Obsidian for plans, technical notes, project ideas, hardware comparisons, study guides, and long-term thinking.",
    paragraphs: [
      "The long-term idea is to connect my notes with AI so I can ask questions across my own knowledge base, update notes conversationally, and use the vault as a kind of second brain.",
      "The website can become the public layer of that system: essays, explainers, troubleshooting notes, project logs, and gear writeups."
    ],
    highlights: [
      "RAG connected to personal documents",
      "AI-assisted notes and retrieval",
      "Hardware comparisons, homelab notes, audio impressions, Linux troubleshooting"
    ],
    accent: "#a991f2"
  },
  photography: {
    id: "photography",
    navLabel: "Photography",
    command: "photo",
    eyebrow: "Visual style",
    title: "Photos can make the site feel like a place, not only a profile.",
    intro:
      "I am interested in photography and visual tools as a way to capture mood, setup, place, and personality.",
    paragraphs: [
      "Future versions can add photos of desks, devices, projects, places, and experiments so the site communicates visually instead of explaining everything through text.",
      "The room should stay pixel-first, with photos appearing as gallery content inside the terminal or as small framed items."
    ],
    highlights: [
      "Fujifilm-inspired visual language",
      "Setup photos, project photos, and device details",
      "A gallery for experiments and small visual notes"
    ],
    accent: "#f27fa5"
  },
  gaming: {
    id: "gaming",
    navLabel: "Gaming",
    command: "gaming",
    eyebrow: "TV and console",
    title: "Games are technical experiences and personal spaces.",
    intro:
      "Gaming is where hardware, software, displays, latency, operating systems, and experience all collide.",
    paragraphs: [
      "I am interested in high-performance PC gaming, VR, handhelds, older tech, portable systems, and the way hardware changes how games feel.",
      "This section can later hold current games, favorites, mini reviews, Steam-style integrations, and performance notes."
    ],
    highlights: [
      "4K high-refresh PC gaming and PCVR",
      "Handhelds, retro displays, older consoles, and portable systems",
      "Performance tuning, upscaling, storage, displays, and input devices"
    ],
    accent: "#7ca7ff"
  },
  now: {
    id: "now",
    navLabel: "Now",
    command: "now",
    eyebrow: "Current focus",
    title: "What I am building, learning, and tuning right now.",
    intro:
      "The Now page is a low-friction place to keep the site alive without turning every update into a polished blog post.",
    paragraphs: [
      "V1 uses placeholders that are ready for real updates. Future versions can integrate current music, games, shows, anime, and ranked favorite lists once those APIs are intentionally added."
    ],
    highlights: [
      "Refining this pixel terminal bedroom",
      "Exploring local AI, homelab infrastructure, and Obsidian workflows",
      "Thinking about audio setup notes, gear pages, and public project writeups",
      "Keeping integrations as future work instead of shipping half-connected accounts"
    ],
    links: [
      { label: "Notes", section: "notes" },
      { label: "Gaming", section: "gaming" },
      { label: "Audio", section: "audio" }
    ],
    accent: "#e8cf6a"
  },
  gear: {
    id: "gear",
    navLabel: "Gear",
    command: "gear",
    eyebrow: "Setup",
    title: "The tools, machines, and little systems I keep coming back to.",
    intro:
      "The gear page should be personal and useful: what I use, why I use it, what tradeoffs I notice, and what I want to improve.",
    paragraphs: [
      "This can grow into a living inventory of the main PC, homelab, laptops, audio chain, cameras, desk setup, operating systems, and software stack.",
      "The point is not just specs. It is about what each tool enables."
    ],
    highlights: [
      "Main PC, server, laptop, and always-on devices",
      "GPUs for local AI, VRAM limits, performance, heat, power, and cost",
      "Audio chain, headphones, IEMs, speakers, cameras, and desk setup",
      "Linux, development tools, CAD, music tools, and creative software"
    ],
    accent: "#d99c71"
  },
  resume: {
    id: "resume",
    navLabel: "Resume",
    command: "resume",
    eyebrow: "Quick scan",
    title: "Computer Engineering, AI projects, leadership, and creative technology.",
    intro:
      "This page is the recruiter-friendly layer: education, technical areas, leadership, projects, and a future PDF resume link.",
    paragraphs: [
      "Currently pursuing a Bachelor's in Computer Engineering at San Jose State University after completing an Associate's in Computer Science at Foothill College.",
      "Technical areas include Python, C++, JavaScript, React, Linux, TensorFlow, PyTorch, Pandas, SQL, CAD tools, and audio software."
    ],
    highlights: [
      "Co-President, Data Science & AI Club",
      "Vice President of Logistics, Owlhacks",
      "Emerging Technologies Institute workshops on neural networks and prompt engineering",
      "Founder and reporter for Principia STEM Magazine"
    ],
    links: [{ label: "Contact", section: "contact" }],
    accent: "#f5efd8"
  },
  contact: {
    id: "contact",
    navLabel: "Contact",
    command: "contact",
    eyebrow: "Get in touch",
    title: "A simple contact page that can be wired to real links next.",
    intro:
      "V1 keeps contact clean and honest until the preferred email, GitHub, LinkedIn, and resume PDF URLs are confirmed.",
    paragraphs: [
      "This page should eventually include direct links for email, GitHub, LinkedIn, resume PDF, and any project repositories worth highlighting.",
      "For now, it acts as the intentional placeholder so the rest of the site already has a complete route."
    ],
    highlights: [
      "Add preferred public email or contact form later",
      "Add GitHub, LinkedIn, and resume PDF links",
      "Keep the page short so visitors know what to do next"
    ],
    accent: "#ff9d70"
  },
  aiush: {
    id: "aiush",
    navLabel: "AI-ush",
    command: "aiush",
    eyebrow: "Prototype terminal",
    title: "AI-ush is a future personal assistant idea, not a fake chatbot in V1.",
    intro:
      "The AI-ush object marks the future idea: an assistant trained on public site content and selected personal notes, with careful privacy and cost boundaries.",
    paragraphs: [
      "A later version can start as a scripted local Q&A assistant, then grow into a real backend once the content, privacy model, and hosting constraints are clear.",
      "For now, AI-ush stays as a visible teaser in the room so the concept is part of the site without pretending to be production-ready."
    ],
    highlights: [
      "Future scripted Q&A from public bio and project data",
      "Possible RAG over selected public notes",
      "No login, no backend, no model API, and no private-note access in V1"
    ],
    accent: "#78d5a2"
  }
};

export const commandAliases: Record<string, SectionId | "help" | "clear"> = {
  h: "help",
  help: "help",
  "?": "help",
  home: "home",
  about: "about",
  bio: "about",
  me: "about",
  projects: "projects",
  project: "projects",
  work: "projects",
  homelab: "homelab",
  lab: "homelab",
  server: "homelab",
  audio: "audio",
  bass: "audio",
  music: "audio",
  notes: "notes",
  obsidian: "notes",
  writing: "notes",
  photo: "photography",
  photos: "photography",
  photography: "photography",
  gaming: "gaming",
  games: "gaming",
  tv: "gaming",
  now: "now",
  current: "now",
  gear: "gear",
  setup: "gear",
  resume: "resume",
  cv: "resume",
  contact: "contact",
  email: "contact",
  aiush: "aiush",
  ai: "aiush",
  clear: "clear",
  cls: "clear"
};
