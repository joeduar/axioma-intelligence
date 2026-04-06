// ============================================
// AXIOMA VENTURES INTELLIGENCE
// Marketplace de Asesorías y Consultoría
// ============================================

export const BRAND = {
  name: "Axioma",
  fullName: "Axioma Ventures Intelligence",
  tagline: "Conectamos expertos con quienes los necesitan",
  description: "La plataforma que conecta asesores especializados con empresas y personas que buscan orientación estratégica en finanzas, negocios, datos, tecnología y más.",
  email: "info@axiomaventures.com",
  whatsapp: "+584241601430",
  year: "2026",
};

export const NAV_LINKS = [
  { label: "Inicio", path: "/" },
  { label: "Asesores", path: "/asesores" },
  { label: "Cómo funciona", path: "/como-funciona" },
  { label: "Nosotros", path: "/nosotros" },
];

export const ADVISORY_CATEGORIES = [
  { id: "finanzas", label: "Finanzas", icon: "BarChart3", desc: "Inversiones, planificación financiera, flujo de caja" },
  { id: "negocios", label: "Negocios", icon: "Briefcase", desc: "Estrategia empresarial, crecimiento, operaciones" },
  { id: "datos", label: "Datos & IA", icon: "Brain", desc: "Analítica, Machine Learning, Business Intelligence" },
  { id: "legal", label: "Legal", icon: "Scale", desc: "Contratos, compliance, propiedad intelectual" },
  { id: "marketing", label: "Marketing", icon: "Megaphone", desc: "Branding, digital, estrategia de contenido" },
  { id: "tecnologia", label: "Tecnología", icon: "Cpu", desc: "Arquitectura de software, infraestructura, ciberseguridad" },
  { id: "rrhh", label: "Recursos Humanos", icon: "Users", desc: "Talento, cultura organizacional, compensación" },
  { id: "startups", label: "Startups", icon: "Rocket", desc: "Fundraising, product-market fit, pitch deck" },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Encuentra tu asesor",
    desc: "Explora nuestro catálogo de expertos verificados. Filtra por especialidad, precio o disponibilidad.",
  },
  {
    step: "02",
    title: "Reserva tu sesión",
    desc: "Elige el horario que mejor se adapte a ti. El pago es seguro y se procesa automáticamente.",
  },
  {
    step: "03",
    title: "Recibe asesoría de calidad",
    desc: "Conéctate por videollamada con tu asesor. Al finalizar, califica tu experiencia.",
  },
];

export const STATS = [
  { label: "Asesores verificados", value: "200+", sub: "En 8 especialidades" },
  { label: "Sesiones completadas", value: "1,400+", sub: "Con 4.9 de calificación" },
  { label: "Tiempo promedio de respuesta", value: "< 2h", sub: "De confirmación" },
];

export const PRICING_PLANS = [
  {
    id: "basico",
    name: "Básico",
    price: 29,
    currency: "USD",
    period: "mes",
    forAdvisors: true,
    features: [
      "Perfil en el catálogo",
      "Hasta 10 sesiones al mes",
      "Cobro automático por sesión",
      "Chat con clientes",
      "Soporte por email",
    ],
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    currency: "USD",
    period: "mes",
    forAdvisors: true,
    features: [
      "Todo lo del plan Básico",
      "Sesiones ilimitadas",
      "Perfil destacado en búsquedas",
      "Badge de asesor verificado",
      "Analíticas de perfil",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
];

export const COMMISSION_RATE = 0.15; // 15% por transacción