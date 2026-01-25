// ===========================================
// DATOS MOCK COMPARTIDOS PARA EVENTU WEB
// ===========================================

export interface MockEvent {
  id: string;
  name: string;
  slug: string;
  description: string;
  date: Date;
  endDate?: Date;
  venue: {
    name: string;
    address: string;
    city: string;
  };
  imageUrl: string;
  bannerUrl?: string;
  priceFrom: number;
  category: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'FEW_LEFT' | 'COMING_SOON';
  isFeatured?: boolean;
  artist?: {
    name: string;
    bio: string;
    imageUrl: string;
  };
  tickets: {
    id: string;
    name: string;
    description: string;
    price: number;
    available: number;
    maxPerOrder: number;
  }[];
  organizer: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  eventCount: number;
}

export interface MockCity {
  id: string;
  name: string;
  eventCount: number;
}

// Categorías de eventos
export const mockCategories: MockCategory[] = [
  { id: '1', name: 'Conciertos', slug: 'conciertos', icon: '🎵', color: '#E53935', eventCount: 45 },
  { id: '2', name: 'Festivales', slug: 'festivales', icon: '🎪', color: '#9C27B0', eventCount: 12 },
  { id: '3', name: 'Teatro', slug: 'teatro', icon: '🎭', color: '#3F51B5', eventCount: 28 },
  { id: '4', name: 'Deportes', slug: 'deportes', icon: '⚽', color: '#4CAF50', eventCount: 35 },
  { id: '5', name: 'Comedia', slug: 'comedia', icon: '😂', color: '#FF9800', eventCount: 18 },
  { id: '6', name: 'Fiestas', slug: 'fiestas', icon: '🎉', color: '#E91E63', eventCount: 52 },
  { id: '7', name: 'Conferencias', slug: 'conferencias', icon: '🎤', color: '#607D8B', eventCount: 15 },
  { id: '8', name: 'Familiares', slug: 'familiares', icon: '👨‍👩‍👧‍👦', color: '#00BCD4', eventCount: 22 },
];

// Ciudades disponibles
export const mockCities: MockCity[] = [
  { id: '1', name: 'Bogotá', eventCount: 120 },
  { id: '2', name: 'Medellín', eventCount: 85 },
  { id: '3', name: 'Cali', eventCount: 45 },
  { id: '4', name: 'Barranquilla', eventCount: 38 },
  { id: '5', name: 'Cartagena', eventCount: 32 },
  { id: '6', name: 'Bucaramanga', eventCount: 18 },
];

// Eventos mock
export const mockEvents: MockEvent[] = [
  {
    id: '1',
    name: 'Bad Bunny - World Tour 2026',
    slug: 'bad-bunny-world-tour-2026',
    description: 'El conejo malo llega a Colombia con su gira mundial más esperada. Una noche inolvidable con todos sus éxitos y sorpresas especiales para sus fans colombianos.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Estadio El Campín',
      address: 'Cra. 30 #57-60',
      city: 'Bogotá',
    },
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=500&fit=crop',
    priceFrom: 250000,
    category: 'Conciertos',
    status: 'AVAILABLE',
    isFeatured: true,
    artist: {
      name: 'Bad Bunny',
      bio: 'Benito Antonio Martínez Ocasio, conocido artísticamente como Bad Bunny, es un rapero, cantante y compositor puertorriqueño.',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    },
    tickets: [
      { id: 't1', name: 'General', description: 'Acceso a zona general', price: 250000, available: 5000, maxPerOrder: 6 },
      { id: 't2', name: 'Preferencial', description: 'Zona preferencial con mejor vista', price: 450000, available: 2000, maxPerOrder: 4 },
      { id: 't3', name: 'VIP', description: 'Acceso VIP con beneficios exclusivos', price: 750000, available: 500, maxPerOrder: 2 },
      { id: 't4', name: 'Platinum', description: 'Experiencia premium con meet & greet', price: 1500000, available: 100, maxPerOrder: 2 },
    ],
    organizer: {
      id: 'org1',
      name: 'Live Nation Colombia',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '2',
    name: 'Karol G - Mañana Será Bonito',
    slug: 'karol-g-manana-sera-bonito',
    description: 'La Bichota trae su tour más exitoso a Colombia. Prepárate para cantar todos sus hits en una noche mágica.',
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Movistar Arena',
      address: 'Calle 63 #59A-06',
      city: 'Bogotá',
    },
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=500&fit=crop',
    priceFrom: 180000,
    category: 'Conciertos',
    status: 'FEW_LEFT',
    isFeatured: true,
    artist: {
      name: 'Karol G',
      bio: 'Carolina Giraldo Navarro, conocida como Karol G, es una cantante y compositora colombiana de reguetón y música urbana.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    },
    tickets: [
      { id: 't1', name: 'General', description: 'Acceso a zona general', price: 180000, available: 200, maxPerOrder: 6 },
      { id: 't2', name: 'Preferencial', description: 'Zona preferencial', price: 320000, available: 100, maxPerOrder: 4 },
      { id: 't3', name: 'VIP', description: 'Zona VIP', price: 550000, available: 50, maxPerOrder: 2 },
    ],
    organizer: {
      id: 'org2',
      name: 'Páramo Presenta',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '3',
    name: 'Feid - MOR Tour',
    slug: 'feid-mor-tour',
    description: 'Ferxxo llega con su gira MOR para deleitar a todos sus fans con su música urbana única.',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Coliseo Live',
      address: 'Autopista Norte km 2.5',
      city: 'Bogotá',
    },
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
    priceFrom: 150000,
    category: 'Conciertos',
    status: 'AVAILABLE',
    tickets: [
      { id: 't1', name: 'General', description: 'Acceso general', price: 150000, available: 3000, maxPerOrder: 6 },
      { id: 't2', name: 'VIP', description: 'Acceso VIP', price: 350000, available: 800, maxPerOrder: 4 },
    ],
    organizer: {
      id: 'org1',
      name: 'Live Nation Colombia',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '4',
    name: 'Morat - Si Ayer Fuera Hoy',
    slug: 'morat-si-ayer-fuera-hoy',
    description: 'La banda colombiana más querida regresa con su nuevo tour lleno de emociones y sus mejores canciones.',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Teatro Metropolitano',
      address: 'Calle 41 #57-30',
      city: 'Medellín',
    },
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    priceFrom: 120000,
    category: 'Conciertos',
    status: 'AVAILABLE',
    tickets: [
      { id: 't1', name: 'Luneta', description: 'Zona luneta', price: 120000, available: 500, maxPerOrder: 6 },
      { id: 't2', name: 'Palco', description: 'Zona palco', price: 180000, available: 200, maxPerOrder: 4 },
    ],
    organizer: {
      id: 'org3',
      name: 'Ocesa Colombia',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '5',
    name: 'Shakira - Las Mujeres Ya No Lloran',
    slug: 'shakira-las-mujeres-ya-no-lloran',
    description: 'La estrella mundial colombiana regresa a casa con su tour más personal y poderoso.',
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Estadio Atanasio Girardot',
      address: 'Cra. 74 #48-139',
      city: 'Medellín',
    },
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop',
    priceFrom: 300000,
    category: 'Conciertos',
    status: 'SOLD_OUT',
    isFeatured: true,
    tickets: [],
    organizer: {
      id: 'org1',
      name: 'Live Nation Colombia',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '6',
    name: 'J Balvin - Colores Tour',
    slug: 'j-balvin-colores-tour',
    description: 'El niño de Medellín trae su colorido espectáculo a Barranquilla.',
    date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Arena del Río',
      address: 'Calle 79B #53-01',
      city: 'Barranquilla',
    },
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop',
    priceFrom: 200000,
    category: 'Conciertos',
    status: 'AVAILABLE',
    tickets: [
      { id: 't1', name: 'General', description: 'Acceso general', price: 200000, available: 4000, maxPerOrder: 6 },
      { id: 't2', name: 'Preferencial', description: 'Zona preferencial', price: 380000, available: 1500, maxPerOrder: 4 },
      { id: 't3', name: 'VIP', description: 'Acceso VIP', price: 600000, available: 400, maxPerOrder: 2 },
    ],
    organizer: {
      id: 'org2',
      name: 'Páramo Presenta',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '7',
    name: 'Festival Estéreo Picnic 2026',
    slug: 'estereo-picnic-2026',
    description: 'El festival más grande de Colombia con artistas internacionales y nacionales durante 4 días.',
    date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 123 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Campo de Golf Briceño 18',
      address: 'Briceño, Sopó',
      city: 'Bogotá',
    },
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
    priceFrom: 450000,
    category: 'Festivales',
    status: 'AVAILABLE',
    isFeatured: true,
    tickets: [
      { id: 't1', name: 'Pase 1 Día', description: 'Acceso por 1 día', price: 450000, available: 10000, maxPerOrder: 4 },
      { id: 't2', name: 'Pase 4 Días', description: 'Acceso completo al festival', price: 1200000, available: 5000, maxPerOrder: 4 },
      { id: 't3', name: 'VIP 4 Días', description: 'Experiencia VIP completa', price: 2500000, available: 1000, maxPerOrder: 2 },
    ],
    organizer: {
      id: 'org2',
      name: 'Páramo Presenta',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
  {
    id: '8',
    name: 'Stand Up Comedy - Los Comediantes',
    slug: 'stand-up-comedy-comediantes',
    description: 'Una noche de risas con los mejores comediantes de Colombia.',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    venue: {
      name: 'Teatro Nacional',
      address: 'Calle 71 #10-25',
      city: 'Bogotá',
    },
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop',
    priceFrom: 80000,
    category: 'Comedia',
    status: 'AVAILABLE',
    tickets: [
      { id: 't1', name: 'General', description: 'Acceso general', price: 80000, available: 400, maxPerOrder: 6 },
      { id: 't2', name: 'VIP', description: 'Mesa VIP', price: 150000, available: 50, maxPerOrder: 4 },
    ],
    organizer: {
      id: 'org4',
      name: 'Comedy Central Colombia',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    },
  },
];

// Blog posts mock
export const mockBlogPosts = [
  {
    id: '1',
    slug: 'como-comprar-boletas-seguras',
    title: 'Cómo comprar boletas de forma segura',
    excerpt: 'Aprende los mejores consejos para evitar fraudes y comprar tus boletas de manera segura.',
    content: `
      <h2>Introducción</h2>
      <p>Comprar boletas para eventos puede ser emocionante, pero también es importante hacerlo de manera segura. En este artículo te compartimos los mejores consejos.</p>

      <h2>1. Compra siempre en sitios oficiales</h2>
      <p>Asegúrate de comprar tus boletas únicamente en plataformas autorizadas como Eventu. Evita comprar a revendedores no verificados.</p>

      <h2>2. Verifica la autenticidad</h2>
      <p>Nuestro sistema SafeTix genera códigos QR dinámicos que cambian constantemente, haciendo imposible la falsificación.</p>

      <h2>3. Guarda tus comprobantes</h2>
      <p>Siempre guarda el comprobante de tu compra y el correo de confirmación.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
    author: {
      name: 'María García',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    category: 'Consejos',
    readTime: 5,
  },
  {
    id: '2',
    slug: 'mejores-festivales-colombia-2026',
    title: 'Los mejores festivales de Colombia en 2026',
    excerpt: 'Descubre los festivales más esperados del año y planifica tu calendario de eventos.',
    content: `
      <h2>2026: El año de los festivales</h2>
      <p>Este año Colombia será sede de increíbles festivales de música, cultura y entretenimiento.</p>

      <h2>Estéreo Picnic</h2>
      <p>El festival más grande del país regresa con un line-up impresionante.</p>

      <h2>Rock al Parque</h2>
      <p>El festival gratuito más grande de Latinoamérica celebra otra edición épica.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
    author: {
      name: 'Carlos Rodríguez',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    category: 'Festivales',
    readTime: 8,
  },
  {
    id: '3',
    slug: 'guia-primer-concierto',
    title: 'Guía para tu primer concierto',
    excerpt: 'Todo lo que necesitas saber antes de asistir a tu primer gran concierto.',
    content: `
      <h2>Preparación</h2>
      <p>Tu primer concierto es una experiencia inolvidable. Aquí te contamos cómo prepararte.</p>

      <h2>Qué llevar</h2>
      <p>Lleva ropa cómoda, tus boletas digitales cargadas y mucha energía.</p>
    `,
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
    author: {
      name: 'Ana López',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    category: 'Guías',
    readTime: 6,
  },
];

// Careers mock
export const mockCareers = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Bogotá (Híbrido)',
    type: 'Tiempo completo',
    experience: '5+ años',
    salary: '$8M - $12M COP',
    postedDaysAgo: 5,
    description: 'Buscamos un desarrollador frontend senior para liderar el desarrollo de nuestra plataforma web.',
    requirements: [
      '5+ años de experiencia en desarrollo frontend',
      'Dominio de React, Next.js y TypeScript',
      'Experiencia con sistemas de diseño',
      'Inglés avanzado',
    ],
    benefits: [
      'Salario competitivo',
      'Trabajo híbrido',
      'Seguro médico',
      'Boletas gratis para eventos',
    ],
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    location: 'Medellín (Remoto)',
    type: 'Tiempo completo',
    experience: '3+ años',
    salary: '$7M - $10M COP',
    postedDaysAgo: 12,
    description: 'Únete a nuestro equipo de producto para definir el futuro de la experiencia de eventos en Colombia.',
    requirements: [
      '3+ años como Product Manager',
      'Experiencia en productos B2C',
      'Habilidades analíticas fuertes',
      'Excelente comunicación',
    ],
    benefits: [
      'Salario competitivo',
      'Trabajo 100% remoto',
      'Equipos de última generación',
      'Presupuesto de aprendizaje',
    ],
  },
  {
    id: '3',
    title: 'Customer Success Specialist',
    department: 'Operations',
    location: 'Bogotá (Presencial)',
    type: 'Tiempo completo',
    experience: '2+ años',
    salary: '$4M - $6M COP',
    postedDaysAgo: 3,
    description: 'Ayuda a nuestros organizadores de eventos a tener éxito en nuestra plataforma.',
    requirements: [
      '2+ años en atención al cliente',
      'Excelentes habilidades de comunicación',
      'Orientación a resultados',
      'Conocimiento de la industria de eventos (deseable)',
    ],
    benefits: [
      'Salario competitivo + bonos',
      'Crecimiento profesional',
      'Ambiente dinámico',
      'Acceso a eventos exclusivos',
    ],
  },
];

// Transacciones mock para admin
export const mockTransactions = [
  {
    id: 'txn_001',
    orderId: 'ord_abc123',
    eventName: 'Bad Bunny - World Tour 2026',
    customerName: 'Juan Pérez',
    customerEmail: 'juan@email.com',
    amount: 750000,
    fee: 75000,
    netAmount: 675000,
    method: 'CARD',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'txn_002',
    orderId: 'ord_def456',
    eventName: 'Karol G - Mañana Será Bonito',
    customerName: 'María García',
    customerEmail: 'maria@email.com',
    amount: 320000,
    fee: 32000,
    netAmount: 288000,
    method: 'NEQUI',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'txn_003',
    orderId: 'ord_ghi789',
    eventName: 'Festival Estéreo Picnic 2026',
    customerName: 'Carlos López',
    customerEmail: 'carlos@email.com',
    amount: 1200000,
    fee: 120000,
    netAmount: 1080000,
    method: 'PSE',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

// Helper para obtener evento por ID
export function getEventById(id: string): MockEvent | undefined {
  return mockEvents.find(event => event.id === id);
}

// Helper para obtener evento por slug
export function getEventBySlug(slug: string): MockEvent | undefined {
  return mockEvents.find(event => event.slug === slug);
}

// Helper para obtener blog post por slug
export function getBlogPostBySlug(slug: string) {
  return mockBlogPosts.find(post => post.slug === slug);
}

// Helper para obtener career por ID
export function getCareerById(id: string) {
  return mockCareers.find(career => career.id === id);
}
