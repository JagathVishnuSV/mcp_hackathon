# Airtable MCP Server: Project Overview

## Purpose
The Airtable MCP Server is a Model Context Protocol (MCP) server that enables programmatic management of Airtable bases, tables, fields, and records. It is designed to be used with clients like Claude Desktop, providing a robust interface for automating and managing Airtable data through LLM-powered workflows.

## Architecture
- **Language:** TypeScript (Node.js)
- **Entry Point:** `src/index.ts` (compiled to `build/index.js`)
- **Core Class:** `AirtableServer` (handles all server logic, tool registration, and request processing)
- **Transport:** Communicates via stdio using MCP protocol
- **Dependencies:** Uses `@modelcontextprotocol/sdk` for server and protocol, and `axios` for HTTP requests to Airtable API

## Main Modules
- `src/index.ts`: Main server logic, tool registration, request handling, and Airtable API integration
- `src/types.ts`: Type definitions for Airtable field types, options, and utility functions
- `scripts/post-build.js`: Ensures correct permissions for the build output on non-Windows systems
- `prompts/`: Contains system prompts and project knowledge for LLM guidance
- `docs/`: Contains detailed documentation, API references, and guides

## Features
- **Base Management:** List, create, and update Airtable bases and tables
- **Field Management:** Create and update fields with type validation and options
- **Record Operations:** CRUD operations on records, including search and retrieval by ID
- **Agentic Table Building:** Supports staged table creation for complex schemas using LLMs
- **Error Handling:** Surfaces Airtable API errors and MCP protocol errors to the client

## Configuration
- **API Key:** Requires an Airtable Personal Access Token with appropriate scopes, provided via the `AIRTABLE_API_KEY` environment variable
- **TypeScript:** Configured via `tsconfig.json` for strict type checking and ES2022 output
- **Build:** Use `npm run build` to compile TypeScript and set permissions

## Usage
- Install dependencies: `npm install`
- Build the project: `npm run build`
- Run the server: `node build/index.js` (or via npx/CLI as configured)
- Integrate with Claude Desktop or other MCP clients by configuring the server command and environment variables

## Scripts
- `build`: Compiles TypeScript and runs the post-build script
- `prepare`: Runs build on install
- `watch`: Watches for changes and rebuilds
- `inspector`: Runs the MCP inspector tool for debugging

## Documentation
- [README.md](../README.md): Quick start, installation, and feature overview
- [working_flow_and_limits.md](working_flow_and_limits.md): Working flow and system limits
- [Airtable API Documentation.md](Airtable%20API%20Documentation.md): Detailed API reference
- [Airtable_MCP_server_guide_for_LLMs.md](Airtable_MCP_server_guide_for_LLMs.md): LLM integration guide
- [project-knowledge.md](../prompts/project-knowledge.md): Project-specific LLM context
- [system-prompt.md](../prompts/system-prompt.md): System prompt for LLMs


---
For more details, see the referenced documentation files and explore the source code in the `src/` directory. 

# Airtable MCP Server Documentation

## Credentials Creation Video
[Watch the credentials creation video](<https://drive.google.com/file/d/1WCgRnPVB0m0ammC6AHLi6vLIJLaeuEAV/view?usp=drive_link>)

## Tool Testing Video
[Watch the tool testing video](<https://drive.google.com/file/d/1-wX0A1P3CVh_thIdD3dw_hJs7-MyCmwO/view?usp=drive_link>)

---
