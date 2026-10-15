export const MCP_TEST_DATABASE_URL =
  process.env.MCP_TEST_DATABASE_URL ??
  'postgresql://opentask:opentask@localhost:5432/opentask_mcp_test';

export const API_PORT = 4311;

export const API_URL = `http://127.0.0.1:${API_PORT}`;

export const PUBLIC_URL = `http://localhost:${API_PORT}`;
