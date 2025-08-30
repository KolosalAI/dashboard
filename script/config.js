// Centralized runtime configuration for API endpoints
// Reads from window.__APP_CONFIG__ (injected by server) with sensible defaults.

function getWindowConfig() {
  if (typeof window !== "undefined" && window.__APP_CONFIG__) {
    return window.__APP_CONFIG__;
  }
  return {};
}

const cfg = getWindowConfig();

export const API_BASE_URL = (cfg.API_BASE_URL || "https://api.kolosal.ai").replace(/\/$/, "");
export const DOCLING_BASE_URL = (cfg.DOCLING_BASE_URL || API_BASE_URL).replace(/\/$/, "");
export const MARKITDOWN_BASE_URL = (cfg.MARKITDOWN_BASE_URL || API_BASE_URL).replace(/\/$/, "");

export function withBase(base, path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const endpoints = {
  status: withBase(API_BASE_URL, "/status"),
  listDocuments: withBase(API_BASE_URL, "/list_documents"),
  infoDocuments: withBase(API_BASE_URL, "/info_documents"),
  removeDocuments: withBase(API_BASE_URL, "/remove_documents"),
  addDocuments: withBase(API_BASE_URL, "/add_documents"),
  retrieve: withBase(API_BASE_URL, "/retrieve"),
  chunking: withBase(API_BASE_URL, "/chunking"),
  models: withBase(API_BASE_URL, "/models"),
  downloads: withBase(API_BASE_URL, "/downloads"),
  health: withBase(API_BASE_URL, "/health"),
  // Parsing endpoints by service
  parseByDocType: (docType) => withBase(API_BASE_URL, `/parse_${docType}`),
  // MarkItDown dedicated endpoints
  markitdownHealth: withBase(MARKITDOWN_BASE_URL, "/health"),
  markitdownParseByDocType: (ext) => {
    // ext should be one of: pdf, docx, xlsx, pptx, html
    const map = { pdf: "pdf", doc: "docx", docx: "docx", xls: "xlsx", xlsx: "xlsx", ppt: "pptx", pptx: "pptx", html: "html", htm: "html", txt: "html" };
    const key = (ext || "").toLowerCase();
    const use = map[key] || "html";
    return withBase(MARKITDOWN_BASE_URL, `/parse_${use}`);
  },
  // Docling commonly uses /v1/convert/file
  doclingHealth: withBase(DOCLING_BASE_URL, "/health"),
  doclingConvertFile: withBase(DOCLING_BASE_URL, "/v1/convert/file"),
};

export default {
  API_BASE_URL,
  DOCLING_BASE_URL,
  MARKITDOWN_BASE_URL,
  withBase,
  endpoints,
};
