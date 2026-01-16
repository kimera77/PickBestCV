import { JobTemplate } from '../types';

export const DEFAULT_TEMPLATES: Omit<JobTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Desarrollador Frontend Senior / Senior Frontend Developer',
    description: `**ES:** Buscamos un Desarrollador Frontend Senior con:

**Habilidades Requeridas:**
- 5+ años de experiencia con React.js y TypeScript
- Sólido conocimiento de CSS moderno (Tailwind, CSS-in-JS)
- Experiencia con Next.js o frameworks SSR similares
- Dominio de gestión de estado (Redux, Zustand, o Context API)
- Control de versiones Git y pipelines CI/CD

**Deseable:**
- Experiencia con frameworks de testing (Jest, React Testing Library)
- Conocimiento de estándares de accesibilidad (WCAG)
- Experiencia con design systems
- Conocimientos de backend (Node.js, REST APIs)

---

**EN:** We are looking for a Senior Frontend Developer with:

**Required Skills:**
- 5+ years of experience with React.js and TypeScript
- Strong understanding of modern CSS (Tailwind, CSS-in-JS)
- Experience with Next.js or similar SSR frameworks
- Proficiency in state management (Redux, Zustand, or Context API)
- Git version control and CI/CD pipelines

**Nice to Have:**
- Experience with testing frameworks (Jest, React Testing Library)
- Knowledge of accessibility standards (WCAG)
- Experience with design systems
- Backend knowledge (Node.js, REST APIs)`,
    userId: 'default',
  },
  {
    title: 'Desarrollador Full Stack / Full Stack Developer',
    description: `**ES:** Buscamos un Desarrollador Full Stack con:

**Requisitos Técnicos:**
- 3+ años de experiencia con JavaScript/TypeScript
- Frontend: React, Vue, o Angular
- Backend: Node.js, Express, o NestJS
- Base de datos: PostgreSQL, MongoDB, o MySQL
- Diseño e implementación de APIs RESTful
- Conocimientos básicos de Docker y contenedores

**Responsabilidades:**
- Desarrollar funcionalidades end-to-end
- Diseñar e implementar APIs
- Escribir código limpio y mantenible
- Participar en decisiones de arquitectura

---

**EN:** We're seeking a Full Stack Developer with:

**Technical Requirements:**
- 3+ years experience with JavaScript/TypeScript
- Frontend: React, Vue, or Angular
- Backend: Node.js, Express, or NestJS
- Database: PostgreSQL, MongoDB, or MySQL
- RESTful API design and implementation
- Docker and containerization basics

**Responsibilities:**
- Develop end-to-end features
- Design and implement APIs
- Write clean, maintainable code
- Participate in architecture decisions`,
    userId: 'default',
  },
  {
    title: 'Diseñador UX/UI / UX/UI Designer',
    description: `**ES:** Buscamos un Diseñador UX/UI creativo con:

**Experiencia Requerida:**
- 3+ años en diseño de productos
- Dominio de Figma, Adobe XD, o Sketch
- Portfolio sólido demostrando habilidades UX/UI
- Comprensión de design systems
- Experiencia con herramientas de prototipado

**Habilidades:**
- Investigación de usuarios y testing de usabilidad
- Arquitectura de información
- Diseño de interacción
- Diseño visual y branding
- Diseño responsive y mobile-first

---

**EN:** Looking for a creative UX/UI Designer with:

**Required Experience:**
- 3+ years in product design
- Proficiency in Figma, Adobe XD, or Sketch
- Strong portfolio demonstrating UX/UI skills
- Understanding of design systems
- Experience with prototyping tools

**Skills:**
- User research and usability testing
- Information architecture
- Interaction design
- Visual design and branding
- Responsive and mobile-first design`,
    userId: 'default',
  },
];
