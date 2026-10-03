/**
 * Swagger / OpenAPI (YAML or JSON) schema extraction.
 *
 * Reads a swagger 2.0 or openapi 3.x spec and converts the relevant schema
 * into the internal fake-server schema format (type aliases like "word",
 * "email", arrays as { __type: "array", ... }, etc.).
 *
 * Works in the browser (window.jsyaml) and in Node (for unit tests).
 */
(function (root) {
  function parseSwaggerFile(content) {
    const trimmed = (content || "").trim();
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed);
    }
    if (typeof window !== "undefined" && window.jsyaml) {
      return window.jsyaml.load(trimmed);
    }
    // Node fallback (used by unit tests)
    const jsyaml = require("js-yaml");
    return jsyaml.load(trimmed);
  }

  function resolveSwaggerRef(ref, spec) {
    if (!ref || typeof ref !== "string") return null;
    const parts = ref.replace(/^#\//, "").split("/");
    let node = spec;
    for (const part of parts) {
      if (!node) return null;
      node = node[decodeURIComponent(part)];
    }
    return node;
  }

  /**
   * Key-name based date override:
   * *create* -> date:-10 (10 days ago)
   * *expire* -> date:10  (10 days ahead)
   * *update* -> date:0   (today)
   * Returns null when the key doesn't match any pattern.
   */
  function dateTypeFromKeyName(key) {
    const name = `${key || ""}`.toLowerCase();
    if (name.indexOf("create") !== -1) return "date:-10";
    if (name.indexOf("expire") !== -1) return "date:10";
    if (name.indexOf("update") !== -1) return "date:0";
    return null;
  }

  function convertSwaggerSchema(schema, spec, depth) {
    depth = depth || 0;
    if (!schema || typeof schema !== "object" || depth > 20) {
      return "word";
    }

    if (schema.$ref) {
      return convertSwaggerSchema(resolveSwaggerRef(schema.$ref, spec), spec, depth + 1);
    }

    if (schema.const !== undefined) {
      return String(schema.const);
    }

    if (Array.isArray(schema.enum) && schema.enum.length > 0) {
      return schema.enum.join("|");
    }

    if (schema.oneOf || schema.anyOf) {
      const list = schema.oneOf || schema.anyOf;
      return convertSwaggerSchema(list[0], spec, depth + 1);
    }

    if (schema.allOf) {
      const merged = {};
      for (const part of schema.allOf) {
        const converted = convertSwaggerSchema(part, spec, depth + 1);
        if (converted && typeof converted === "object" && !Array.isArray(converted)) {
          Object.assign(merged, converted);
        }
      }
      return merged;
    }

    let type = schema.type;
    // OpenAPI 3.1 nullable types: type: ["string", "null"]
    if (Array.isArray(type)) {
      type = type.find((entry) => entry !== "null") || "word";
    }
    type = type || (schema.properties ? "object" : "word");

    if (type === "array") {
      return {
        __type: "array",
        __range: "10,15",
        __property: convertSwaggerSchema(schema.items || { type: "string" }, spec, depth + 1)
      };
    }

    if (type === "object") {
      const result = {};
      const properties = schema.properties || {};
      for (const key of Object.keys(properties)) {
        result[key] = dateTypeFromKeyName(key) ||
          convertSwaggerSchema(properties[key], spec, depth + 1);
      }
      if (Object.keys(result).length === 0 && schema.additionalProperties) {
        result.key = convertSwaggerSchema(schema.additionalProperties, spec, depth + 1);
      }
      return result;
    }

    const format = schema.format || "";
    const formatMap = {
      uuid: "id",
      email: "email",
      "date-time": "date-time",
      date: "date",
      uri: "url",
      url: "url",
      ipv4: "ipaddress",
      ipv6: "ipaddress",
      phone: "phone",
      zipcode: "zipcode",
      "postal-code": "zipcode"
    };
    if (formatMap[format]) {
      return formatMap[format];
    }

    const typeMap = {
      integer: "integer",
      number: "float",
      float: "float",
      double: "float",
      boolean: "boolean",
      string: "word"
    };
    return typeMap[type] || "word";
  }

  /** Pick the JSON-ish media type from an openapi content map. */
  function findJsonContent(content) {
    if (!content || typeof content !== "object") return null;
    const keys = Object.keys(content);
    if (keys.length === 0) return null;
    const jsonKey = keys.find((key) => key.toLowerCase().includes("json")) || keys[0];
    return content[jsonKey] || null;
  }

  /**
   * Map a media type to a fake-server file type:
   * application/pdf -> pdf, text/csv -> csv, image/* -> image.
   */
  function fileTypeFromMediaType(mediaType) {
    const type = `${mediaType || ""}`.toLowerCase();
    if (type === "application/pdf") return "pdf";
    if (type === "text/csv") return "csv";
    if (type === "application/image" || type.indexOf("image/") === 0) return "image";
    return null;
  }

  /** The outer media-type map of the success response, if any. */
  function resolveResponseContentMap(response, spec) {
    if (!response || typeof response !== "object") return null;
    if (response.$ref) {
      return resolveResponseContentMap(resolveSwaggerRef(response.$ref, spec), spec);
    }
    return response.content || null;
  }

  /** First media type of the success response, if any. */
  function resolveResponseMediaType(responses, spec) {
    if (!responses || typeof responses !== "object") return null;
    const successResponse = responses["200"] || responses["201"] ||
      responses["default"] || responses[Object.keys(responses)[0]];
    const contentMap = resolveResponseContentMap(successResponse, spec);
    if (!contentMap) return null;
    const keys = Object.keys(contentMap);
    return keys.length > 0 ? keys[0] : null;
  }

  /** Resolve a response object (openapi 3 $ref or swagger 2 schema form). */
  function resolveResponseSchema(response, spec) {
    if (!response || typeof response !== "object") return null;
    if (response.$ref) {
      return resolveResponseSchema(resolveSwaggerRef(response.$ref, spec), spec);
    }
    if (response.schema) {
      return response.schema;
    }
    const content = findJsonContent(response.content);
    if (content && content.schema) {
      return content.schema;
    }
    return null;
  }

  /** Resolve a requestBody object (openapi 3 $ref or inline form). */
  function resolveRequestBodySchema(requestBody, spec) {
    if (!requestBody || typeof requestBody !== "object") return null;
    if (requestBody.$ref) {
      return resolveRequestBodySchema(resolveSwaggerRef(requestBody.$ref, spec), spec);
    }
    const content = findJsonContent(requestBody.content);
    return (content && content.schema) || null;
  }

  /**
   * Match a concrete route (e.g. /users/123) against a spec path that may
   * contain templates ({id}) and/or a base path prefix (e.g. /api/v1/users/{id}).
   */
  function matchSpecPath(specPath, routeName) {
    if (!specPath || typeof specPath !== "string") return false;
    const segments = specPath.split("/").filter((segment) => segment.length > 0);
    for (let i = 0; i < segments.length; i++) {
      const partial = "/" + segments.slice(i).join("/");
      const regex = new RegExp(
        "^" + partial.split("/").map((segment) =>
          segment.startsWith("{") && segment.endsWith("}")
            ? "[^/]+"
            : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        ).join("/") + "$"
      );
      if (regex.test(routeName)) {
        return true;
      }
    }
    return false;
  }

  /**
   * List all operations in the spec as { path, method, operation }.
   * Deterministic order: paths in spec order, methods in the given order.
   */
  function listOperations(spec) {
    const operations = [];
    if (!spec || !spec.paths || typeof spec.paths !== "object") {
      return operations;
    }
    const methods = ["post", "put", "patch", "get", "delete", "head", "options"];
    for (const path of Object.keys(spec.paths)) {
      const pathItem = spec.paths[path] || {};
      for (const method of methods) {
        if (pathItem[method]) {
          operations.push({
            path,
            method: method.toUpperCase(),
            operation: pathItem[method]
          });
        }
      }
    }
    return operations;
  }

  /**
   * Infer a fake-server type alias from a concrete example value.
   */
  function inferTypeFromExample(value) {
    if (typeof value === "number") {
      return Number.isInteger(value) ? "integer" : "float";
    }
    if (typeof value === "boolean") {
      return "boolean";
    }
    if (Array.isArray(value)) {
      return {
        __type: "array",
        __range: "10,15",
        __property: value.length > 0 ? inferTypeFromExample(value[0]) : "word"
      };
    }
    if (value && typeof value === "object") {
      return inferSchemaFromExample(value);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
      if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed)) return "image";
      if (/\.pdf(\?.*)?$/i.test(trimmed)) return "pdf";
      if (/\.csv(\?.*)?$/i.test(trimmed)) return "csv";
      if (/\.docx?(\?.*)?$/i.test(trimmed)) return "doc";
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) return "date-time";
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "date";
      if (/^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?$/i.test(trimmed)) return "time";
      if (/^\d{5}(-\d{4})?$/.test(trimmed)) return "zipcode";
      if (/^https?:\/\//i.test(trimmed)) return "url";
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) return "ipaddress";
      if (/^\d{10}$/.test(trimmed)) return "second";
      if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/.test(trimmed)) return "alphanumeric";
      return "word";
    }
    return "word";
  }

  /**
   * Build a fake-server schema object from a concrete response example.
   */
  function inferSchemaFromExample(example) {
    if (!example || typeof example !== "object" || Array.isArray(example)) {
      return {};
    }
    const schema = {};
    for (const key of Object.keys(example)) {
      schema[key] = dateTypeFromKeyName(key) || inferTypeFromExample(example[key]);
    }
    return schema;
  }

  /** Resolve a response object down to its media-type content map. */
  function resolveResponseContent(response, spec) {
    if (!response || typeof response !== "object") return null;
    if (response.$ref) {
      return resolveResponseContent(resolveSwaggerRef(response.$ref, spec), spec);
    }
    return findJsonContent(response.content) || null;
  }

  /**
   * Infer a schema from the 200 response's JSON example values.
   * Returns null when the operation has no example.
   */
  function resolveResponseExampleSchema(responses, spec) {
    if (!responses || typeof responses !== "object") return null;
    const successResponse = responses["200"] || responses["201"] ||
      responses["default"] || responses[Object.keys(responses)[0]];
    const content = resolveResponseContent(successResponse, spec);
    if (!content) return null;

    let example = content.example;
    if (example === undefined && content.examples && typeof content.examples === "object") {
      const first = content.examples[Object.keys(content.examples)[0]];
      example = first && first.value !== undefined ? first.value : first;
    }
    if (example === undefined || example === null) return null;

    if (Array.isArray(example)) {
      return {
        __type: "array",
        __range: "10,15",
        __property: example.length > 0 ? inferTypeFromExample(example[0]) : "word"
      };
    }
    return inferSchemaFromExample(example);
  }

  /**
   * Extract the schema for the given route (name + method) from the spec.
   * Priority: response example values, then request body (when
   * preferRequestBody is set), then the response schema, then the request
   * body schema as a fallback. Falls back to the first definition/schema
   * when there is no path match at all.
   * Returns { converted, sourceLabel } or null when nothing is found.
   */
  function extractSchemaFromSwagger(spec, routeName, routeType, preferRequestBody) {
    if (!spec || typeof spec !== "object") {
      return null;
    }

    const schemas = spec.definitions || (spec.components && spec.components.schemas) || {};
    const normalizedRouteName = (routeName || "").trim();
    const normalizedRouteType = (routeType || "").trim().toLowerCase();
    const bodyMethods = ["post", "put", "patch"];

    let schema = null;
    let sourceLabel = "";
    let alreadyConverted = false;

    if (spec.paths && normalizedRouteName && normalizedRouteType) {
      const pathKey = Object.keys(spec.paths).find((key) => {
        if (key === normalizedRouteName) return true;
        return matchSpecPath(key, normalizedRouteName);
      });
      const pathEntry = pathKey ? spec.paths[pathKey] : null;

      if (pathEntry) {
        const operation = pathEntry[normalizedRouteType] ||
          pathEntry[Object.keys(pathEntry).find((key) => key.toLowerCase() === normalizedRouteType)];

        if (operation) {
          // 1. file response media types (application/pdf, text/csv, image/*)
          const mediaType = resolveResponseMediaType(operation.responses, spec);
          const fileType = mediaType ? fileTypeFromMediaType(mediaType) : null;
          if (fileType) {
            schema = { file: fileType };
            alreadyConverted = true;
            sourceLabel = `${normalizedRouteName} (${normalizedRouteType.toUpperCase()}) ${fileType} response`;
          }

          // 2. concrete response example values
          if (!schema) {
            schema = resolveResponseExampleSchema(operation.responses, spec);
            if (schema) {
              alreadyConverted = true;
              sourceLabel = `${normalizedRouteName} (${normalizedRouteType.toUpperCase()}) response example`;
            }
          }

          // 3. request body schema when the caller prefers it (upload flow)
          if (!schema && preferRequestBody && operation.requestBody &&
            bodyMethods.indexOf(normalizedRouteType) !== -1) {
            schema = resolveRequestBodySchema(operation.requestBody, spec);
            if (schema) {
              sourceLabel = `${normalizedRouteName} (${normalizedRouteType.toUpperCase()}) request body`;
            }
          }

          // 4. success response schema
          if (!schema && operation.responses) {
            const responses = operation.responses;
            const successResponse = responses["200"] || responses["201"] ||
              responses["default"] || responses[Object.keys(responses)[0]];
            schema = resolveResponseSchema(successResponse, spec);
            if (schema) {
              sourceLabel = `${normalizedRouteName} (${normalizedRouteType.toUpperCase()}) response`;
            }
          }

          // 5. request body schema fallback for methods that carry a body
          if (!schema && operation.requestBody &&
            bodyMethods.indexOf(normalizedRouteType) !== -1) {
            schema = resolveRequestBodySchema(operation.requestBody, spec);
            if (schema) {
              sourceLabel = `${normalizedRouteName} (${normalizedRouteType.toUpperCase()}) request body`;
            }
          }
        }
      }
    }

    if (!schema) {
      const firstKey = Object.keys(schemas)[0];
      schema = firstKey ? schemas[firstKey] : null;
      sourceLabel = firstKey ? `schema "${firstKey}"` : "";
    }

    if (!schema) {
      return null;
    }

    return {
      converted: alreadyConverted ? schema : convertSwaggerSchema(schema, spec),
      sourceLabel
    };
  }

  /**
   * Tokenize a curl command line, keeping quoted values intact
   * (including escaped quotes inside them).
   */
  function tokenizeCurl(input) {
    const tokens = [];
    const regex = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\S+/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
      tokens.push(match[0]);
    }
    return tokens;
  }

  /**
   * Parse a curl command line.
   * Returns { method, url, routeName, body, hasBody } or null when the
   * input is not a curl command. The route name is the URL path only.
   */
  function parseCurlCommand(curlText) {
    const input = `${curlText || ""}`.trim();
    if (!/^curl(\s|$)/i.test(input)) {
      return null;
    }

    const clean = (value) => value
      .replace(/^['"]|['"]$/g, "")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    let method = "";
    let url = "";
    let body = "";

    const tokens = tokenizeCurl(input);
    for (let i = 0; i < tokens.length; i++) {
      const lower = tokens[i].toLowerCase();

      if (lower === "-x" || lower === "--request") {
        method = clean(tokens[i + 1] || "").toUpperCase();
        i++;
      } else if (lower === "--url") {
        url = clean(tokens[i + 1] || "");
        i++;
      } else if (lower === "-d" || lower === "--data" || lower === "--data-raw" || lower === "--data-binary") {
        body = clean(tokens[i + 1] || "");
        i++;
      } else if (lower === "-h" || lower === "--header") {
        i++; // skip the header value
      } else if (lower.startsWith("-")) {
        // other flags (silent, include, user-agent, ...) - nothing to do
      } else if (!url && /^https?:\/\//i.test(clean(tokens[i]))) {
        url = clean(tokens[i]);
      }
    }

    if (!method) {
      method = body ? "POST" : "GET";
    }

    let routeName = "/";
    try {
      routeName = new URL(url).pathname || "/";
    } catch (error) {
      routeName = url.replace(/^https?:\/\/[^/]+/i, "") || "/";
    }

    return {
      method,
      url,
      routeName,
      body,
      hasBody: body.length > 0
    };
  }

  /**
   * Split generated route objects into create/update batches based on the
   * project's existing routes. A route matches on name AND method.
   * Returns { toCreate, toUpdate } where toUpdate entries are
   * { existing, route }.
   */
  function planRouteUpserts(existingRoutes, routeObjects) {
    const existing = Array.isArray(existingRoutes) ? existingRoutes : [];
    const toCreate = [];
    const toUpdate = [];

    for (const routeObj of routeObjects || []) {
      const match = existing.find(
        (route) => route && route.name === routeObj.name && route.type === routeObj.type
      );
      if (match) {
        toUpdate.push({ existing: match, route: routeObj });
      } else {
        toCreate.push(routeObj);
      }
    }

    return { toCreate, toUpdate };
  }

  const api = {
    parseSwaggerFile,
    parseCurlCommand,
    planRouteUpserts,
    listOperations,
    extractSchemaFromSwagger,
    convertSwaggerSchema,
    inferTypeFromExample,
    inferSchemaFromExample,
    dateTypeFromKeyName
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.SwaggerSchema = api;
})(typeof window !== "undefined" ? window : globalThis);
