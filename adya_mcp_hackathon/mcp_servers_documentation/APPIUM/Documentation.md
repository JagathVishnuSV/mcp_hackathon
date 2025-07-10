# **Appium MCP Integration Server**

## Overview

Implementation of a system that uses a custom **MCP (Model Context Protocol)** server to automate Android applications via **Appium**.  
The server provides a RESTful API to launch and control Android apps using Appium drivers, making it easy to trigger UI automation through HTTP requests.

This project has been tested and works with an **Android Emulator** configured via Android Studio and connected to Appium.

---

## Hackathon Objective

The goal is to use **Appium** with a custom **MCP server** to:

- Launch Android apps automatically  
- Control screen navigation  
- Run tasks programmatically  

---

## Features

### 1. Launch Android Apps  
Launch any installed app using the **package** and **activity name**.

### 2. Run UI Automation Tasks  
Use Appium under the hood to interact with **Android emulators or real devices**.

### 3. MCP-Compatible API  
REST API that follows **Model Context Protocol** structure.

---

## Prerequisites

Ensure the following are installed and set up:

- Python 3.10+
- Android SDK and **Android Emulator** (e.g., `emulator-5554`)
- Appium Server (installed and running)
- Appium Python client:

```bash
pip install Appium-Python-Client
```

- Flask for HTTP API server:

```bash
pip install Flask
```

---

## Installation

### 1. Start the Android Emulator

Start your emulator using Android Studio or command-line:

```bash
emulator -avd <Your_Emulator_Name>
```

Make sure it's running and detected:

```bash
adb devices
```

### 2. Start Appium Server

```bash
appium 
```

### 3. Start Flask MCP Server

```bash
python server.py
```

---

## JSON Configuration (Plugin Manifest)

```json
{
  "schema_version": "v1",
  "name_for_human": "Appium MCP Integration",
  "name_for_model": "appium_tool",
  "description_for_human": "Automate Android apps using Appium via MCP",
  "description_for_model": "Launch and control Android apps using Appium. Use this to test UI or perform automated tasks.",
  "auth": {
    "type": "none"
  },
  "api": {
    "type": "openapi",
    "url": "http://localhost:5000/openapi.json"
  }
}
```

---

## API Endpoints

### 1. `/execute` – Launch Android App

**Method:** POST  
**Request Body:**

```json
{
  "action": "launch_app",
  "app_package": "com.android.settings",
  "app_activity": "com.android.settings.Settings$ApnEditorActivity"
}
```

**Response:**

```json
{
  "status": "App launched successfully!"
}
```

---

### 2. `/status` – Check MCP Server Health

**Method:** GET  
**Response:**

```json
{
  "status": "OK"
}
```

---

## Sample Use Cases

### Launching Settings App

```json
{
  "action": "launch_app",
  "app_package": "com.android.settings",
  "app_activity": "com.android.settings.Settings"
}
```

---

## How It Works

1. Start an Android Emulator using AVD.  
2. Flask MCP server listens for incoming HTTP POST requests.  
3. When a request to launch an app is received, Appium sends commands to the emulator.  
4. The requested app is opened on the emulator’s screen.  
5. The MCP server returns success or error based on the Appium response.  

---

## 📽️ Demo Video

[![Watch the demo](image/image.png)](https://drive.google.com/file/d/1Pky4pNKcsqtzcDqBtIhbmr_8uR0QKFT8/view?usp=sharing)

> Click the image to watch the demo video.


---

## Summary

- **MCP (Model Context Protocol)** enables standardized communication with tools like AI assistants.  
- **Appium** automates user interfaces of Android apps.  
- This project combines both technologies to enable easy automation via HTTP requests using an **Android Emulator** or real device.


