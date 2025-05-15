export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  skills: string[];
}

export const DUMMY_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp India",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "₹25L - ₹35L per annum",
    description:
      "We are looking for an experienced React developer to join our team. You will be responsible for building user interfaces and implementing new features.",
    skills: ["React", "TypeScript", "Redux", "Next.js"],
  },
  {
    id: 2,
    title: "Node.js Backend Developer",
    company: "Innovate Solutions",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹20L - ₹30L per annum",
    description:
      "Join our backend team to build scalable and efficient server-side applications using Node.js and related technologies.",
    skills: ["Node.js", "Express", "MongoDB", "AWS"],
  },
  {
    id: 3,
    title: "GenAI Developer",
    company: "AI Solutions Ltd",
    location: "Mumbai, India",
    type: "Full-time",
    salary: "₹30L - ₹45L per annum",
    description:
      "Work on cutting-edge AI projects, implementing and optimizing large language models and AI solutions.",
    skills: ["Python", "TensorFlow", "PyTorch", "LLMs"],
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "Digital Innovations",
    location: "Delhi, India",
    type: "Full-time",
    salary: "₹28L - ₹40L per annum",
    description:
      "Looking for a full stack developer to work on end-to-end development of web applications.",
    skills: ["React", "Node.js", "PostgreSQL", "Docker"],
  },
];
