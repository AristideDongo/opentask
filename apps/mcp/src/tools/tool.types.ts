import type { z } from 'zod';
import type { OpenTaskClient } from '../client/opentask-client';

export type ToolAccess = 'read' | 'write';

export interface ToolResult {
  summary: string;
  data: Record<string, unknown>;
}

export interface ToolDefinition<Shape extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  title: string;
  description: string;
  access: ToolAccess;
  idempotent?: boolean;
  inputSchema: Shape;
  run(client: OpenTaskClient, input: z.infer<z.ZodObject<Shape>>): Promise<ToolResult>;
}

export const defineTool = <Shape extends z.ZodRawShape>(tool: ToolDefinition<Shape>) =>
  tool as unknown as ToolDefinition;
