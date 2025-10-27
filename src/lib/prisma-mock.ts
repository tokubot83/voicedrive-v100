// Mock PrismaClient for browser environment
// This file is used when @prisma/client is imported in client-side code

export class PrismaClient {
  constructor() {
    console.warn('PrismaClient is not available in browser environment');
  }

  // Mock all Prisma model methods
  user = this.createMockModel();
  post = this.createMockModel();
  vote = this.createMockModel();
  comment = this.createMockModel();
  notification = this.createMockModel();
  auditLog = this.createMockModel();
  department = this.createMockModel();
  facility = this.createMockModel();
  project = this.createMockModel();
  interview = this.createMockModel();
  proposal = this.createMockModel();
  whistleblowingReport = this.createMockModel();

  private createMockModel() {
    const mockPromise = () => Promise.reject(new Error('PrismaClient is not available in browser'));

    return {
      findMany: mockPromise,
      findUnique: mockPromise,
      findFirst: mockPromise,
      create: mockPromise,
      update: mockPromise,
      delete: mockPromise,
      deleteMany: mockPromise,
      updateMany: mockPromise,
      upsert: mockPromise,
      count: mockPromise,
      aggregate: mockPromise,
      groupBy: mockPromise,
    };
  }

  async $connect() {
    console.warn('PrismaClient.$connect() called in browser');
  }

  async $disconnect() {
    console.warn('PrismaClient.$disconnect() called in browser');
  }

  async $transaction(fn: any) {
    console.warn('PrismaClient.$transaction() called in browser');
    return Promise.reject(new Error('Transactions not available in browser'));
  }

  async $executeRaw(...args: any[]) {
    console.warn('PrismaClient.$executeRaw() called in browser');
    return Promise.reject(new Error('Raw queries not available in browser'));
  }

  async $queryRaw(...args: any[]) {
    console.warn('PrismaClient.$queryRaw() called in browser');
    return Promise.reject(new Error('Raw queries not available in browser'));
  }
}

export default PrismaClient;
