import {
  SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiNodedotjs,
  SiExpress, SiFlutter, SiDart, SiShopify, SiPython, SiGit, SiGithub, SiTailwindcss,
  SiFirebase, SiSupabase, SiFigma, SiMongodb, SiMysql, SiPostgresql, SiAndroid,
  SiKotlin, SiSwift, SiDocker, SiVite, SiRedux, SiSass, SiBootstrap, SiLinux, SiC,
  SiCplusplus, SiPhp, SiDjango, SiFlask, SiTensorflow, SiPytorch, SiVercel,
  SiGraphql, SiThreedotjs, SiWordpress, SiPostman, SiJest,
} from "react-icons/si";
import { FaJava, FaGraduationCap } from "react-icons/fa6";
import { FiCalendar, FiCode, FiBriefcase, FiAward, FiStar, FiLayers } from "react-icons/fi";

// Skill icons selectable in the admin. Keys are stored in the database.
export const SKILL_ICONS = {
  SiHtml5: { icon: SiHtml5, label: "HTML", color: "#e34f26" },
  SiCss: { icon: SiCss, label: "CSS", color: "#2965f1" },
  SiJavascript: { icon: SiJavascript, label: "JavaScript", color: "#f7df1e" },
  SiTypescript: { icon: SiTypescript, label: "TypeScript", color: "#3178c6" },
  SiReact: { icon: SiReact, label: "React", color: "#61dafb" },
  SiNextdotjs: { icon: SiNextdotjs, label: "Next.js", color: "#ffffff" },
  SiNodedotjs: { icon: SiNodedotjs, label: "Node.js", color: "#5fa04e" },
  SiExpress: { icon: SiExpress, label: "Express", color: "#ffffff" },
  SiFlutter: { icon: SiFlutter, label: "Flutter", color: "#02569b" },
  SiDart: { icon: SiDart, label: "Dart", color: "#0175c2" },
  SiShopify: { icon: SiShopify, label: "Shopify", color: "#7ab55c" },
  SiPython: { icon: SiPython, label: "Python", color: "#3776ab" },
  FaJava: { icon: FaJava, label: "Java", color: "#f89820" },
  SiC: { icon: SiC, label: "C", color: "#a8b9cc" },
  SiCplusplus: { icon: SiCplusplus, label: "C++", color: "#00599c" },
  SiPhp: { icon: SiPhp, label: "PHP", color: "#777bb4" },
  SiKotlin: { icon: SiKotlin, label: "Kotlin", color: "#7f52ff" },
  SiSwift: { icon: SiSwift, label: "Swift", color: "#f05138" },
  SiAndroid: { icon: SiAndroid, label: "Android", color: "#3ddc84" },
  SiGit: { icon: SiGit, label: "Git", color: "#f05032" },
  SiGithub: { icon: SiGithub, label: "GitHub", color: "#ffffff" },
  SiTailwindcss: { icon: SiTailwindcss, label: "Tailwind CSS", color: "#06b6d4" },
  SiSass: { icon: SiSass, label: "Sass", color: "#cc6699" },
  SiBootstrap: { icon: SiBootstrap, label: "Bootstrap", color: "#7952b3" },
  SiRedux: { icon: SiRedux, label: "Redux", color: "#764abc" },
  SiVite: { icon: SiVite, label: "Vite", color: "#646cff" },
  SiThreedotjs: { icon: SiThreedotjs, label: "Three.js", color: "#ffffff" },
  SiGraphql: { icon: SiGraphql, label: "GraphQL", color: "#e10098" },
  SiFirebase: { icon: SiFirebase, label: "Firebase", color: "#ffca28" },
  SiSupabase: { icon: SiSupabase, label: "Supabase", color: "#3ecf8e" },
  SiMongodb: { icon: SiMongodb, label: "MongoDB", color: "#47a248" },
  SiMysql: { icon: SiMysql, label: "MySQL", color: "#4479a1" },
  SiPostgresql: { icon: SiPostgresql, label: "PostgreSQL", color: "#4169e1" },
  SiDjango: { icon: SiDjango, label: "Django", color: "#44b78b" },
  SiFlask: { icon: SiFlask, label: "Flask", color: "#ffffff" },
  SiTensorflow: { icon: SiTensorflow, label: "TensorFlow", color: "#ff6f00" },
  SiPytorch: { icon: SiPytorch, label: "PyTorch", color: "#ee4c2c" },
  SiDocker: { icon: SiDocker, label: "Docker", color: "#2496ed" },
  SiLinux: { icon: SiLinux, label: "Linux", color: "#fcc624" },
  SiVercel: { icon: SiVercel, label: "Vercel", color: "#ffffff" },
  SiFigma: { icon: SiFigma, label: "Figma", color: "#f24e1e" },
  SiWordpress: { icon: SiWordpress, label: "WordPress", color: "#21759b" },
  SiPostman: { icon: SiPostman, label: "Postman", color: "#ff6c37" },
  SiJest: { icon: SiJest, label: "Jest", color: "#c21325" },
};

export const FALLBACK_SKILL_ICON = { icon: FiLayers, label: "Other", color: "#c8a15a" };

export function getSkillIcon(key) {
  return SKILL_ICONS[key] ?? FALLBACK_SKILL_ICON;
}

// Icons for the About section stat tiles.
export const STAT_ICONS = {
  calendar: FiCalendar,
  code: FiCode,
  briefcase: FiBriefcase,
  graduation: FaGraduationCap,
  trophy: FiAward,
  star: FiStar,
};
