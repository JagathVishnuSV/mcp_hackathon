# Splunk MCP Tool Documentation

## Operating Modes

The tool supports three operating modes:

### 1. SSE Mode (Default)
- **Communication**: Server-Sent Events based (real-time, bidirectional)
- **Usage**: Ideal for web-based MCP clients
- **Startup**: Default mode (no arguments needed)
- **Access**: `/sse` endpoint

### 2. API Mode
- **Communication**: RESTful API endpoints
- **Usage**: Programmatic access
- **Startup**: `python splunk_mcp.py api`
- **Access**: `/api/v1` endpoint prefix

### 3. STDIO Mode
- **Communication**: Standard Input/Output
- **Usage**: Integrates with Claude Desktop and other AI assistants
- **Startup**: `python splunk_mcp.py stdio`

---

## Features

- 🔍 **Splunk Search**: Execute Splunk queries using natural language
- 🗂️ **Index Management**: List and inspect Splunk indexes
- 👥 **User Management**: View and manage users
- 🗃️ **KV Store Operations**: Create, list, and manage collections
- ⚡ **Async Support**: Built with async/await for high performance
- 📜 **Detailed Logging**: Includes emoji indicators for enhanced visibility
- 🔒 **SSL Configuration**: Flexible verification options
- 🐞 **Enhanced Debugging**: Logs connection and errors for troubleshooting
- ✅ **Comprehensive Testing**: Unit tests included
- 🚨 **Robust Error Handling**: Proper status codes
- 🌐 **SSE Compliance**: Meets MCP SSE specification

---

## Available MCP Tools

### 🔧 Tools Management
- `list_tools`  
  Lists all MCP tools with descriptions and parameters

### 🏥 Health Check
- `health_check`  
  Returns available Splunk apps for verifying connectivity  
- `ping`  
  Simple ping to verify server status

### 👤 User Management
- `current_user`  
  Displays info of the authenticated user  
- `list_users`  
  Lists all users and their roles

### 📦 Index Management
- `list_indexes`  
  Lists all accessible indexes  
- `get_index_info`  
  Returns detailed info on a specific index  
  - **Parameters**: `index_name` (string)  
- `indexes_and_sourcetypes`  
  Returns all indexes with their sourcetypes

### 🔎 Search
- `search_splunk`  
  Executes a Splunk search  
  - **Parameters**:  
    - `search_query` (string)  
    - `earliest_time` (string, optional)  
    - `latest_time` (string, optional)  
    - `max_results` (integer, optional)  
- `list_saved_searches`  
  Lists saved searches

### 🗃️ KV Store
- `list_kvstore_collections`  
  Lists all KV store collections  
- `create_kvstore_collection`  
  Creates a new collection  
  - **Parameters**: `collection_name` (string)  
- `delete_kvstore_collection`  
  Deletes an existing collection  
  - **Parameters**: `collection_name` (string)  

---

## SSE Endpoints (SSE Mode)

### `/sse`
- Returns metadata in `text/event-stream` format
- Provides:
  - Connection details
  - Messages endpoint URL
  - Protocol and capability info

### `/sse/messages`
- Main SSE stream
- Maintains a persistent connection
- Sends:
  - Heartbeats
  - Formatted SSE events

### `/sse/health`
- Health status and version info in SSE format

---
