export const createTestUser = (suffix: string = "") => ({
  email: `test-${Date.now()}-${suffix}@example.com`,
  username: `testuser${Date.now()}${suffix}`,
  password: "Test123!@#",
  name: `Test User ${suffix}`,
});
