# Pen Pal Server

Pen Pal is a tool designed to automatically scan codebases for vulnerabilities and extract useful information, helping developers identify security issues.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [nodemon](https://nodemon.io/) (for development auto-reloading)
- [OpenAI API key](https://openai.com/api/)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   - Copy the example config file:

     ```bash
     cp config/default.example.json config/default.json
     ```

   - Open `config/default.json` and update the configuration values as needed (e.g., API keys, database URIs, ports).

   - This is where you will need to add your OpenAI API key `OPENAI_API_KEY`

### Running the Server

```bash
npm run dev
```

The API will be available at `http://localhost:<port>` (see your config).

> **Note:** You will need to manually add your APIs URL to the `pen-pal-extension/background.js` file in the variable `API_URL`. If you are running with the default configurations then everything is set for you.

### Setting a target

Variables `TARGET_HOST` and `TARGET_URL` are used to define a target web application. A more streamlined approach will be added in the future.

For example, if I am trying to pen test [Juice Shop](https://hub.docker.com/r/bkimminich/juice-shop) on port 3001 I would use the following configurations:

```
  "TARGET_HOST": "localhost",
  "TARGET_URL": "http://localhost:3001",
```

Example Docker command to start Juice Shop on port 3001

```
docker run -d -p 127.0.0.1:3001:3000 bkimminich/juice-shop
```
