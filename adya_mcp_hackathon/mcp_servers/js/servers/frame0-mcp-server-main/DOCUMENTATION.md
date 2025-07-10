# Project Documentation

## Configuration

Configuration settings allow you to customize the behavior of the application. Common configuration options include environment variables and configuration files.

### Using Environment Variables
Environment variables are key-value pairs used to configure your application without hardcoding values. They are typically set in the operating system or in a `.env` file for local development.

- Create a `.env` file in the project root (if supported by your setup).
- Example:
  ```env
  PORT=3000
  NODE_ENV=development
  API_URL=https://api.example.com
  ```
- Load environment variables using a package like `dotenv` (if using Node.js):
  `dotenv` is a zero-dependency module that loads environment variables from a `.env` file into `process.env`, making it easy to manage configuration for different environments.
  ```js
  require('dotenv').config();
  ```

### Using Configuration Files
Configuration files like `config.json` or `config.js` allow you to store and organize settings in a structured format. These files can be imported and used directly in your application code.

- You can create a `config.json` or `config.js` file to store configuration options.
- Example `config.json`:
  ```json
  {
    "port": 3000,
    "apiUrl": "https://api.example.com"
  }
  ```

## Credentials

Credentials are sensitive pieces of information such as API keys, database passwords, and secret tokens. **Never commit credentials to version control.**

### Managing Credentials
A secrets manager is a tool or service designed to securely store, access, and manage sensitive information like API keys and passwords. For local development, environment variables or a `.env` file are commonly used to keep credentials out of your codebase.

- Store credentials in environment variables or a secure secrets manager.
- Example `.env` file:
  ```env
  DB_PASSWORD=your_db_password
  API_KEY=your_api_key
  ```
- Access credentials in your code using `process.env` (Node.js):
  ```js
  const dbPassword = process.env.DB_PASSWORD;
  ```

### Security Best Practices
- Add `.env` and any credential files to `.gitignore`.
- Use tools like [dotenv](https://www.npmjs.com/package/dotenv) for local development.
- For production, use environment variables or a dedicated secrets management service.

## MCP Tools Overview

Below is a list of MCP tools provided by this project. Each tool enables specific actions within Frame0, such as creating, updating, or exporting shapes and pages. These tools are accessible via the MCP server API and are designed to automate and extend Frame0's capabilities.

- **create_frame**: Creates a new frame shape (e.g., phone, tablet, desktop) in Frame0. Must add a new page before creating a frame.
- **create_rectangle**: Adds a rectangle shape to a frame or page. You can specify position, size, color, and corner radius.
- **create_ellipse**: Adds an ellipse (circle/oval) shape to a frame or page. Position, size, and colors are customizable.
- **create_text**: Creates a text shape (label, paragraph, heading, link, or normal) with customizable content and style.
- **create_line**: Draws a straight line between two points. Useful for connectors or dividers in diagrams.
- **create_polygon**: Creates a polygon or polyline shape by specifying a list of points. Can be open or closed, with custom colors.
- **create_connector**: Draws a connector line between two shapes, with optional arrowheads and color.
- **create_icon**: Adds an icon shape from the available icon set. You can specify size, position, and color.
- **create_image**: Inserts an image shape using base64-encoded image data. Supports PNG, JPEG, WebP, and SVG formats.
- **update_shape**: Updates properties (size, color, text, etc.) of an existing shape by its ID.
- **duplicate_shape**: Duplicates a shape, optionally moving it by a specified offset. Useful for quickly copying elements.
- **delete_shape**: Deletes a shape by its ID, removing it from the page or frame.
- **search_icons**: Searches for available icons by name or tag. Helps you find the right icon for your design.
- **move_shape**: Moves a shape by a specified delta (dx, dy) in the coordinate system.
- **align_shapes**: Aligns or distributes multiple shapes according to the specified alignment type (e.g., left, center, distribute).
- **group**: Groups multiple shapes together, allowing them to be moved or styled as a unit.
- **ungroup**: Ungroups a previously grouped set of shapes, making them independent again.
- **set_link**: Sets a link from a shape to a URL, another page, or a backward action. Useful for interactive prototypes.
- **export_shape_as_image**: Exports a shape as an image file (PNG, JPEG, or WebP) for use outside Frame0.
- **add_page**: Adds a new page to the document. The new page becomes the current page.
- **update_page**: Updates the name or properties of an existing page by its ID.
- **duplicate_page**: Duplicates a page, optionally giving the copy a new name.
- **delete_page**: Deletes a page by its ID, removing it from the document.
- **get_current_page_id**: Retrieves the ID of the current page in Frame0.
- **set_current_page_by_id**: Sets the current page by its ID, switching the editing context.
- **get_page**: Retrieves data for a specific page (or the current page if no ID is given), including shapes if requested.
- **get_all_pages**: Retrieves data for all pages in the document, optionally including all shapes.
- **export_page_as_image**: Exports a page as an image file (PNG, JPEG, or WebP) for external use.



For more details, refer to the README or contact the project maintainer. 