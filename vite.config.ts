import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    modulePreload: {
      resolveDependencies: (_url, deps, context) => {
        if (context.hostType !== "html") return deps;

        // Keep initial preload lean; defer heavy, route-specific chunks.
        return deps.filter((dep) => {
          if (dep.includes("vendor-markdown")) return false;
          if (dep.includes("vendor-recharts")) return false;
          if (dep.includes("vendor-dnd")) return false;
          if (dep.includes("vendor-guideflow")) return false;
          if (dep.includes("GuideFlow")) return false;
          return true;
        });
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (
            id.includes("react-router-dom") ||
            id.includes("react-dom") ||
            id.includes(`${path.sep}react${path.sep}`) ||
            id.includes("@tanstack/react-query")
          ) {
            return "vendor-react";
          }

          if (id.includes("@supabase/")) return "vendor-supabase";
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils")
          ) {
            return "vendor-motion";
          }
          if (
            id.includes("recharts") ||
            id.includes("d3-") ||
            id.includes("d3/")
          ) {
            return "vendor-recharts";
          }
          if (id.includes("@xyflow/react")) return "vendor-guideflow";
          if (
            id.includes("@radix-ui/") ||
            id.includes("react-remove-scroll") ||
            id.includes("use-sidecar") ||
            id.includes("use-callback-ref")
          ) {
            return "vendor-radix";
          }
          if (id.includes("@dnd-kit/")) return "vendor-dnd";
          if (
            id.includes("markdown-it") ||
            id.includes("marked") ||
            id.includes("turndown") ||
            id.includes("sanitize-html") ||
            id.includes("dompurify") ||
            id.includes("htmlparser2") ||
            id.includes("domutils") ||
            id.includes("domhandler") ||
            id.includes("entities") ||
            id.includes("mdurl")
          ) {
            // Keep markdown-related libs in vendor-misc to avoid circular chunk imports
            // between vendor-misc <-> vendor-markdown that can break runtime initialization.
            return "vendor-misc";
          }
          if (id.includes("date-fns")) return "vendor-date";
          if (id.includes("zod")) return "vendor-zod";
          if (id.includes("embla-carousel")) return "vendor-carousel";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("lodash")) return "vendor-utils";
          return "vendor-misc";
        },
      },
    },
  },
}));
