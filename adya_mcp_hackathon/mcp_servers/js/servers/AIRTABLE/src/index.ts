#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";
import { FieldOption, fieldRequiresOptions, getDefaultOptions, FieldType } from "./types.js";

class AirtableServer {
  private server: Server;
  private sessionToolUsage: Map<string, Set<string>> = new Map();
  private sessionWelcomed: Set<string> = new Set();
  private static RESTRICTED_TOOLS = [
    "create_record",
    "delete_record",
    "update_record",
    "list_records",
    "get_record",
    "search_records",
    "create_field",
    "update_field",
  ];
  private static OVERRIDE_PHRASES = [
    "create multiple",
    "create ",
    "add more",
    "again",
    "list again",
    "another",
    "more",
    "repeat",
    "next",
    "several",
    "many",
    "multiple",
    "all",
    "batch",
    "bulk"
  ];

  constructor() {
    this.server = new Server({
      name: "airtable-server",
      version: "0.2.0"
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private validateField(field: FieldOption): FieldOption {
    const { type } = field;

    // Remove options for fields that don't need them
    if (!fieldRequiresOptions(type as FieldType)) {
      const { options, ...rest } = field;
      return rest;
    }

    // Add default options for fields that require them
    if (!field.options) {
      return {
        ...field,
        options: getDefaultOptions(type as FieldType),
      };
    }

    return field;
  }

  private setupToolHandlers() {
    // Register available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (_input, _ctx) => ({
      tools: [
        {
          name: "list_bases",
          description: "List all accessible Airtable bases",
          inputSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        },
        {
          name: "list_tables",
          description: "List all tables in a base",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
            },
            required: ["base_id"],
          },
        },
        {
          name: "create_table",
          description: "Create a new table in a base",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the new table",
              },
              description: {
                type: "string",
                description: "Description of the table",
              },
              fields: {
                type: "array",
                description: "Initial fields for the table",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Name of the field",
                    },
                    type: {
                      type: "string",
                      description: "Type of the field (e.g., singleLineText, multilineText, number, etc.)",
                    },
                    description: {
                      type: "string",
                      description: "Description of the field",
                    },
                    options: {
                      type: "object",
                      description: "Field-specific options",
                    },
                  },
                  required: ["name", "type"],
                },
              },
            },
            required: ["base_id", "table_name"],
          },
        },
        {
          name: "update_table",
          description: "Update a table's schema",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_id: {
                type: "string",
                description: "ID of the table to update",
              },
              name: {
                type: "string",
                description: "New name for the table",
              },
              description: {
                type: "string",
                description: "New description for the table",
              },
            },
            required: ["base_id", "table_id"],
          },
        },
        {
          name: "create_field",
          description: "Create a new field in a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_id: {
                type: "string",
                description: "ID of the table",
              },
              field: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the field",
                  },
                  type: {
                    type: "string",
                    description: "Type of the field",
                  },
                  description: {
                    type: "string",
                    description: "Description of the field",
                  },
                  options: {
                    type: "object",
                    description: "Field-specific options",
                  },
                },
                required: ["name", "type"],
              },
            },
            required: ["base_id", "table_id", "field"],
          },
        },
        {
          name: "update_field",
          description: "Update a field in a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_id: {
                type: "string",
                description: "ID of the table",
              },
              field_id: {
                type: "string",
                description: "ID of the field to update",
              },
              updates: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "New name for the field",
                  },
                  description: {
                    type: "string",
                    description: "New description for the field",
                  },
                  options: {
                    type: "object",
                    description: "New field-specific options",
                  },
                },
              },
            },
            required: ["base_id", "table_id", "field_id", "updates"],
          },
        },
        {
          name: "list_records",
          description: "List records in a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the table",
              },
              max_records: {
                type: "number",
                description: "Maximum number of records to return",
              },
            },
            required: ["base_id", "table_name"],
          },
        },
        {
          name: "create_record",
          description: "Create a new record in a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the table",
              },
              fields: {
                type: "object",
                description: "Record fields as key-value pairs",
              },
            },
            required: ["base_id", "table_name", "fields"],
          },
        },
        {
          name: "update_record",
          description: "Update an existing record in a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the table",
              },
              record_id: {
                type: "string",
                description: "ID of the record to update",
              },
              fields: {
                type: "object",
                description: "Record fields to update as key-value pairs",
              },
            },
            required: ["base_id", "table_name", "record_id", "fields"],
          },
        },
        {
          name: "delete_record",
          description: "Delete a record from a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the table",
              },
              record_id: {
                type: "string",
                description: "ID of the record to delete",
              },
            },
            required: ["base_id", "table_name", "record_id"],
          },
        },
        {
          name: "search_records",
          description: "Search for records in a table",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the table",
              },
              field_name: {
                type: "string",
                description: "Name of the field to search in",
              },
              value: {
                type: "string",
                description: "Value to search for",
              },
            },
            required: ["base_id", "table_name", "field_name", "value"],
          },
        },
        {
          name: "get_record",
          description: "Get a single record by its ID",
          inputSchema: {
            type: "object",
            properties: {
              base_id: {
                type: "string",
                description: "ID of the base",
              },
              table_name: {
                type: "string",
                description: "Name of the table",
              },
              record_id: {
                type: "string",
                description: "ID of the record to retrieve",
              },
            },
            required: ["base_id", "table_name", "record_id"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request, _ctx) => {
      // --- SESSION-BASED TOOL USAGE LIMITATION ---
      let sessionId = "default";
      const meta = request.params && typeof request.params._meta === 'object' && request.params._meta !== null ? request.params._meta as Record<string, any> : undefined;
      if (meta) {
        sessionId = (meta.session_id || meta.conversation_id || meta.user_id || "default").toString();
      }

      // Show welcome message once per session
      if (!this.sessionWelcomed.has(sessionId)) {
        this.sessionWelcomed.add(sessionId);
        return {
          content: [{
            type: "text",
            text: `You can use the following tools to interact with your Airtable account:\n\n- List available bases\n- Show tables in a base\n- Create, update, and manage tables and fields\n- List, add, update, and delete records\n- Search for records\n- Get a record by its ID\n\nI don’t have direct access to your credentials, but I can perform these actions through the tools provided.`
          }]
        };
      }

      // --- DYNAMIC CREDENTIALS EXTRACTION ---
      // DEBUG: Log the received credentials for troubleshooting
      console.log("DEBUG: received selected_server_credentials:", JSON.stringify(request.params.selected_server_credentials));
      // Extract credentials from params only (body is not available in this context)
      const selectedServerCredentials = request.params.selected_server_credentials || {};
      const credentials = (selectedServerCredentials as { AIRTABLE?: { base_id?: string; api_key?: string } })?.AIRTABLE || {};
      const baseId = credentials.base_id;
      const apiKey = credentials.api_key;
      if (!baseId || !apiKey) {
        throw new McpError(ErrorCode.InvalidParams, "Missing Airtable credentials (base_id or api_key). Provide them in selected_server_credentials.AIRTABLE.");
      }

      // Create axios instance for this request
      const axiosInstance = axios.create({
        baseURL: "https://api.airtable.com/v0",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const toolName = request.params.name;
      // Only restrict for certain tools
      if (AirtableServer.RESTRICTED_TOOLS.includes(toolName)) {
        // Get or create the set of used tools for this session
        let usedTools = this.sessionToolUsage.get(sessionId);
        if (!usedTools) {
          usedTools = new Set();
          this.sessionToolUsage.set(sessionId, usedTools);
        }
        // If already used, check for override phrases
        if (usedTools.has(toolName)) {
          const input = JSON.stringify(request.params.arguments || "").toLowerCase();
          const override = AirtableServer.OVERRIDE_PHRASES.some(phrase => input.includes(phrase));
          if (!override) {
            return {
              content: [{
                type: "text",
                text: `⚠️ The "${toolName}" tool has already been used in this session. To run it again, please specify clearly (e.g., "create 5 fields", "list again").`
              }]
            };
          }
        } else {
          usedTools.add(toolName);
        }
      }

      try {
        switch (request.params.name) {
          case "list_bases": {
            try {
              const response = await axiosInstance.get("/meta/bases");
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data.bases, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable list_bases API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "list_tables": {
            try {
              const { base_id } = request.params.arguments as { base_id: string };
              const baseId = base_id;
              const response = await axiosInstance.get(`/meta/bases/${baseId}/tables`);
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data.tables, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable list_tables API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "create_table": {
            try {
              const { base_id, table_name, description, fields } = request.params.arguments as {
                base_id: string;
                table_name: string;
                description?: string;
                fields?: FieldOption[];
              };
              const validatedFields = fields?.map(field => this.validateField(field));
              const baseId = base_id;
              const response = await axiosInstance.post(`/meta/bases/${baseId}/tables`, {
                name: table_name,
                description,
                fields: validatedFields,
              });
              console.log("Airtable create_table API response:", response.data);
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable create_table API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "update_table": {
            try {
              const { base_id, table_id, name, description } = request.params.arguments as {
                base_id: string;
                table_id: string;
                name?: string;
                description?: string;
              };
              const baseId = base_id;
              const response = await axiosInstance.patch(`/meta/bases/${baseId}/tables/${table_id}`, {
                name,
                description,
              });
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable update_table API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "create_field": {
            try {
              const { base_id, table_id, field } = request.params.arguments as {
                base_id: string;
                table_id: string;
                field: FieldOption;
              };
              const validatedField = this.validateField(field);
              const baseId = base_id;
              const response = await axiosInstance.post(
                `/meta/bases/${baseId}/tables/${table_id}/fields`,
                validatedField
              );
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable create_field API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "update_field": {
            try {
              const { base_id, table_id, field_id, updates } = request.params.arguments as {
                base_id: string;
                table_id: string;
                field_id: string;
                updates: Partial<FieldOption>;
              };
              const baseId = base_id;
              const response = await axiosInstance.patch(
                `/meta/bases/${baseId}/tables/${table_id}/fields/${field_id}`,
                updates
              );
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable update_field API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "list_records": {
            try {
              const { base_id, table_name, max_records } = request.params.arguments as {
                base_id: string;
                table_name: string;
                max_records?: number;
              };
              const baseId = base_id;
              const response = await axiosInstance.get(`/${baseId}/${table_name}`, {
                params: max_records ? { maxRecords: max_records } : undefined,
              });
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data.records, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable list_records API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "create_record": {
            try {
              const { base_id, table_name, fields } = request.params.arguments as {
                base_id: string;
                table_name: string;
                fields: Record<string, any>;
              };
              const baseId = base_id;
              const response = await axiosInstance.post(`/${baseId}/${table_name}`, {
                fields,
              });
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable create_record API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "update_record": {
            try {
              const { base_id, table_name, record_id, fields } = request.params.arguments as {
                base_id: string;
                table_name: string;
                record_id: string;
                fields: Record<string, any>;
              };
              const baseId = base_id;
              const response = await axiosInstance.patch(
                `/${baseId}/${table_name}/${record_id}`,
                { fields }
              );
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable update_record API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "delete_record": {
            try {
              const { base_id, table_name, record_id } = request.params.arguments as {
                base_id: string;
                table_name: string;
                record_id: string;
              };
              const baseId = base_id;
              const response = await axiosInstance.delete(
                `/${baseId}/${table_name}/${record_id}`
              );
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable delete_record API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "search_records": {
            try {
              const { base_id, table_name, field_name, value } = request.params.arguments as {
                base_id: string;
                table_name: string;
                field_name: string;
                value: string;
              };
              const baseId = base_id;
              const response = await axiosInstance.get(`/${baseId}/${table_name}`, {
                params: {
                  filterByFormula: `{${field_name}} = \"${value}\"`,
                },
              });
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data.records, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable search_records API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          case "get_record": {
            try {
              const { base_id, table_name, record_id } = request.params.arguments as {
                base_id: string;
                table_name: string;
                record_id: string;
              };
              const baseId = base_id;
              const response = await axiosInstance.get(
                `/${baseId}/${table_name}/${record_id}`
              );
              return {
                content: [{
                  type: "text",
                  text: JSON.stringify(response.data, null, 2),
                }],
              };
            } catch (error) {
              const err = error as any;
              console.error("Airtable get_record API error:", err?.response?.data || err.message || err);
              return {
                content: [{
                  type: "text",
                  text: "Airtable API error: " + JSON.stringify(err?.response?.data || err.message || err),
                }],
              };
            }
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `Airtable API error: ${error.response?.data?.error?.message ?? error.message}`
          );
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Airtable MCP server running on stdio");
  }
}

const server = new AirtableServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
