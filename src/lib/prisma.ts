// Mock PrismaClient for development without database
// Replace with actual Prisma client when database is configured

type MockModel = {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args?: any) => Promise<any>;
    findFirst: (args?: any) => Promise<any>;
    create: (args?: any) => Promise<any>;
    createMany: (args?: any) => Promise<{ count: number }>;
    update: (args?: any) => Promise<any>;
    updateMany: (args?: any) => Promise<{ count: number }>;
    delete: (args?: any) => Promise<any>;
    deleteMany: (args?: any) => Promise<{ count: number }>;
    count: (args?: any) => Promise<number>;
    aggregate: (args?: any) => Promise<any>;
    groupBy: (args?: any) => Promise<any[]>;
    upsert: (args?: any) => Promise<any>;
};

type MockPrismaClient = {
    user: MockModel;
    event: MockModel;
    venue: MockModel;
    ticket: MockModel;
    order: MockModel;
    orderItem: MockModel;
    coordinatorAssignment: MockModel;
    presale: MockModel;
    presaleCode: MockModel;
    presaleCodeUsage: MockModel;
    ticketType: MockModel;
    auditLog: MockModel;
    commission: MockModel;
    tax: MockModel;
    paymentProviderConfig: MockModel;
    payment: MockModel;
    venueMap: MockModel;
    section: MockModel;
    seat: MockModel;
    $transaction: (fn: any) => Promise<any>;
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
};

declare global {
    var prisma: MockPrismaClient | undefined;
}

// Create a mock that returns empty results
const createMockModel = (): MockModel => ({
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (args: any) => ({ id: 'mock-id', ...args?.data }),
    createMany: async (args: any) => ({ count: args?.data?.length || 0 }),
    update: async (args: any) => ({ id: args?.where?.id, ...args?.data }),
    updateMany: async () => ({ count: 0 }),
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    count: async () => 0,
    aggregate: async () => ({ _sum: {}, _count: 0, _avg: {}, _min: {}, _max: {} }),
    groupBy: async () => [],
    upsert: async (args: any) => ({ id: 'mock-id', ...args?.create }),
});

/**
 * Prisma client singleton for database operations
 * Currently using mock until database is configured
 */
export const prisma: MockPrismaClient = globalThis.prisma || {
    user: createMockModel(),
    event: createMockModel(),
    venue: createMockModel(),
    ticket: createMockModel(),
    order: createMockModel(),
    orderItem: createMockModel(),
    coordinatorAssignment: createMockModel(),
    presale: createMockModel(),
    presaleCode: createMockModel(),
    presaleCodeUsage: createMockModel(),
    ticketType: createMockModel(),
    auditLog: createMockModel(),
    commission: createMockModel(),
    tax: createMockModel(),
    paymentProviderConfig: createMockModel(),
    payment: createMockModel(),
    venueMap: createMockModel(),
    section: createMockModel(),
    seat: createMockModel(),
    $transaction: async (fn: any) => fn(prisma),
    $connect: async () => {},
    $disconnect: async () => {},
};

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;
