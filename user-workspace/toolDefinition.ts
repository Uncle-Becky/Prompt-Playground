type ToolDefinition = {
    name: string;
    description: string;
    parameters: Record<string, any>;
    handler: (args: any) => Promise<any>;
  };
  