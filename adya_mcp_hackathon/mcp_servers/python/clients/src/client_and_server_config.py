ClientsConfig =[
    "MCP_CLIENT_AZURE_AI",
    "MCP_CLIENT_OPENAI",
	"MCP_CLIENT_GEMINI"
]
ServersConfig = [
    {
        "server_name": "SPLUNK-MCP",
        "command": "poetry",
        "cwd":"../servers/splunk-mcp",
        # "env": {
        #     "SPLUNK_HOST": "prd-p-8x97m.splunkcloud.com",
        #     "SPLUNK_PORT": "443",
        #     "SPLUNK_USERNAME": "",
        #     "SPLUNK_PASSWORD": "",
        #     "SPLUNK_SCHEME": "https",
        #     "SPLUNK_TOKEN=",
        #     "VERIFY_SSL": "false",
        #     "FASTMCP_PORT": "8001",
        #     "DEBUG": "true"
        # },
        "args": [
            
            "run",
            "python",
            "splunk_mcp.py",
            "stdio"
        ]
    }
]
