export const createTestUser = (suffix: string = '') => ({
    email: `test-${Date.now()}-${suffix}@example.com`,
    password: 'Test123!@#',
    name: `Test User ${suffix}`,
});
