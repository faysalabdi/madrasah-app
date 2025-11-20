import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import type { Server } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

let server: Server | undefined;

async function initializeApp() {
  if (!server) {
    server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    }
  }
  return app;
}

// For local development
if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === undefined) {
  (async () => {
    const app = await initializeApp();
    
    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
    
    if (process.env.NODE_ENV === "development" && server) {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    }
    
    if (server) {
      server.listen(port, host, () => {
        log(`serving on port ${port} at http://${host}:${port}`);
      });
    }
  })();
}

// Export for Vercel serverless
export default async function handler(req: Request, res: Response) {
  const app = await initializeApp();
  return app(req, res);
}
