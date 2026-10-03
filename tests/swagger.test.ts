import { describe, it } from 'node:test';
import assert from 'node:assert';

// The swagger helpers live in a browser script; require it like a plain module.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SwaggerSchema = require('../public/js/swagger.js');

const swagger2Yaml = `
swagger: "2.0"
info:
  title: Blog API
  version: 1.0.0
paths:
  /list:
    post:
      responses:
        "200":
          schema:
            $ref: "#/definitions/Blog"
definitions:
  Blog:
    type: object
    properties:
      title:
        type: string
      author:
        type: string
        format: email
      details:
        type: string
      status:
        type: string
        enum: [draft, published, archived]
      tags:
        type: array
        items:
          type: string
      meta:
        type: object
        properties:
          views:
            type: integer
`;

const openapi3Yaml = `
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
        address:
          type: object
          properties:
            city:
              type: string
        friends:
          type: array
          items:
            type: object
            properties:
              nickname:
                type: string
`;

const dateKeyYaml = `
openapi: 3.0.0
info:
  title: Date Keys API
  version: 1.0.0
paths:
  /dates:
    get:
      responses:
        "200":
          content:
            application/json:
              example:
                createdAt: "2024-01-15T10:30:00Z"
                expiresAt: "2025-01-15T10:30:00Z"
                updatedAt: "2024-06-01T00:00:00Z"
                title: "Hello World"
  /dates-schema:
    get:
      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  CreatedAt:
                    type: string
                    format: date-time
                  expiresAt:
                    type: string
                    format: date-time
                  updatedAt:
                    type: string
                    format: date-time
                  name:
                    type: string
`;

const fileMediaYaml = `
openapi: 3.0.0
info:
  title: File API
  version: 1.0.0
paths:
  /report:
    get:
      responses:
        "200":
          content:
            application/pdf:
              schema:
                type: string
                format: binary
  /export:
    get:
      responses:
        "200":
          content:
            text/csv:
              schema:
                type: string
  /photo:
    get:
      responses:
        "200":
          content:
            image/png:
              schema:
                type: string
                format: binary
`;

const exampleYaml = `
openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
paths:
  /posts:
    get:
      responses:
        "200":
          content:
            application/json:
              example:
                id: 3
                title: "Hello World"
                score: 4.5
                email: "user@example.com"
                image: "https://cdn.example.com/photo.png"
                file: "https://cdn.example.com/report.pdf"
                createdAt: "2024-01-15T10:30:00Z"
                zip: "12345"
                ip: "192.168.1.1"
                active: true
                tags:
                  - "a"
                  - "b"
`;

const openapi3RichYaml = `
openapi: 3.0.0
info:
  title: Rich API
  version: 1.0.0
paths:
  /api/v1/orders:
    post:
      responses:
        "200":
          $ref: "#/components/responses/OrderResponse"
  /api/v1/items:
    put:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                sku:
                  type: string
  /api/v1/search:
    get:
      responses:
        "200":
          content:
            application/vnd.api+json:
              schema:
                $ref: "#/components/schemas/SearchResult"
  /api/v1/both:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                fromBody:
                  type: string
      responses:
        "200":
          content:
            application/json:
              schema:
                type: object
                properties:
                  fromResponse:
                    type: integer
components:
  responses:
    OrderResponse:
      description: ok
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Order"
  schemas:
    Order:
      type: object
      properties:
        orderId:
          type: integer
        status:
          type: string
          const: shipped
        note:
          type: [string, "null"]
    SearchResult:
      type: object
      properties:
        total:
          type: integer
`;


describe('swagger schema extraction', () => {
  describe('parseSwaggerFile', () => {
    it('parses a yaml spec', () => {
      const spec = SwaggerSchema.parseSwaggerFile(swagger2Yaml);
      assert.equal(spec.swagger, '2.0');
      assert.ok(spec.definitions.Blog);
    });

    it('parses a json spec', () => {
      const spec = SwaggerSchema.parseSwaggerFile(JSON.stringify({ openapi: '3.0.0', paths: {} }));
      assert.equal(spec.openapi, '3.0.0');
    });

    it('returns null for empty input', () => {
      assert.equal(SwaggerSchema.parseSwaggerFile(''), null);
    });
  });

  describe('extractSchemaFromSwagger - swagger 2.0', () => {
    it('uses the matching path + method response schema', () => {
      const spec = SwaggerSchema.parseSwaggerFile(swagger2Yaml);
      const result = SwaggerSchema.extractSchemaFromSwagger(spec, '/list', 'POST');
      assert.ok(result);
      assert.equal(result.sourceLabel, '/list (POST) response');
      assert.deepEqual(result.converted, {
        title: 'word',
        author: 'email',
        details: 'word',
        status: 'draft|published|archived',
        tags: { __type: 'array', __range: '10,15', __property: 'word' },
        meta: { views: 'integer' }
      });
    });

    it('falls back to the first definition when no route matches', () => {
      const spec = SwaggerSchema.parseSwaggerFile(swagger2Yaml);
      const result = SwaggerSchema.extractSchemaFromSwagger(spec, '/other', 'GET');
      assert.ok(result);
      assert.equal(result.sourceLabel, 'schema "Blog"');
      assert.equal(result.converted.title, 'word');
    });

    it('returns null when the spec has no definitions and no paths', () => {
      const spec = { openapi: '3.0.0' };
      assert.equal(SwaggerSchema.extractSchemaFromSwagger(spec, '/x', 'GET'), null);
    });
  });

  describe('extractSchemaFromSwagger - openapi 3', () => {
    it('resolves components.schemas refs including path params', () => {
      const spec = SwaggerSchema.parseSwaggerFile(openapi3Yaml);
      const result = SwaggerSchema.extractSchemaFromSwagger(spec, '/users/123', 'GET');
      assert.ok(result);
      assert.equal(result.sourceLabel, '/users/123 (GET) response');
      assert.deepEqual(result.converted, {
        id: 'id',
        createdAt: 'date:-10',
        address: { city: 'word' },
        friends: {
          __type: 'array',
          __range: '10,15',
          __property: { nickname: 'word' }
        }
      });
    });
  });

  describe('extractSchemaFromSwagger - openapi 3 extras', () => {
    const spec = () => SwaggerSchema.parseSwaggerFile(openapi3RichYaml);

    it('resolves a response-level $ref', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/api/v1/orders', 'POST');
      assert.ok(result);
      assert.equal(result.sourceLabel, '/api/v1/orders (POST) response');
      assert.deepEqual(result.converted, {
        orderId: 'integer',
        status: 'shipped',
        note: 'word'
      });
    });

    it('falls back to the requestBody schema for a PUT without a response schema', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/api/v1/items', 'PUT');
      assert.ok(result);
      assert.equal(result.sourceLabel, '/api/v1/items (PUT) request body');
      assert.deepEqual(result.converted, { sku: 'word' });
    });

    it('reads json data from a vendor-specific content type', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/api/v1/search', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, { total: 'integer' });
    });

    it('matches a route against a spec path with a base path prefix', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/items', 'PUT');
      assert.ok(result);
      assert.deepEqual(result.converted, { sku: 'word' });
    });

    it('prefers the request body schema when requested', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/api/v1/both', 'POST', true);
      assert.ok(result);
      assert.equal(result.sourceLabel, '/api/v1/both (POST) request body');
      assert.deepEqual(result.converted, { fromBody: 'word' });
    });

    it('prefers the response schema by default', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/api/v1/both', 'POST');
      assert.ok(result);
      assert.equal(result.sourceLabel, '/api/v1/both (POST) response');
      assert.deepEqual(result.converted, { fromResponse: 'integer' });
    });
  });

  describe('listOperations', () => {
    it('lists every operation with an uppercase method', () => {
      const operations = SwaggerSchema.listOperations(SwaggerSchema.parseSwaggerFile(openapi3RichYaml));
      const keys = operations.map((op) => `${op.method} ${op.path}`);
      assert.deepEqual(keys, [
        'POST /api/v1/orders',
        'PUT /api/v1/items',
        'GET /api/v1/search',
        'POST /api/v1/both'
      ]);
      assert.ok(operations.every((op) => op.method === op.method.toUpperCase()));
    });

    it('returns an empty list when there are no paths', () => {
      assert.deepEqual(SwaggerSchema.listOperations({}), []);
      assert.deepEqual(SwaggerSchema.listOperations(null), []);
    });
  });

  describe('response example inference', () => {
    it('infers the schema from the 200 response example values', () => {
      const spec = SwaggerSchema.parseSwaggerFile(exampleYaml);
      const result = SwaggerSchema.extractSchemaFromSwagger(spec, '/posts', 'GET');
      assert.ok(result);
      assert.equal(result.sourceLabel, '/posts (GET) response example');
      assert.deepEqual(result.converted, {
        id: 'integer',
        title: 'word',
        score: 'float',
        email: 'email',
        image: 'image',
        file: 'pdf',
        createdAt: 'date:-10',
        zip: 'zipcode',
        ip: 'ipaddress',
        active: 'boolean',
        tags: { __type: 'array', __range: '10,15', __property: 'word' }
      });
    });

    it('falls back to schema types when there is no example', () => {
      const spec = SwaggerSchema.parseSwaggerFile(openapi3RichYaml);
      const result = SwaggerSchema.extractSchemaFromSwagger(spec, '/api/v1/search', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, { total: 'integer' });
    });
  });

  describe('file media type responses', () => {
    const spec = () => SwaggerSchema.parseSwaggerFile(fileMediaYaml);

    it('maps application/pdf to the pdf type', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/report', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, { file: 'pdf' });
      assert.equal(result.sourceLabel, '/report (GET) pdf response');
    });

    it('maps text/csv to the csv type', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/export', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, { file: 'csv' });
    });

    it('maps image/* to the image type', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/photo', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, { file: 'image' });
    });
  });

  describe('date key-name overrides', () => {
    const spec = () => SwaggerSchema.parseSwaggerFile(dateKeyYaml);

    it('maps *create*, *expire* and *update* keys from example values', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/dates', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, {
        createdAt: 'date:-10',
        expiresAt: 'date:10',
        updatedAt: 'date:0',
        title: 'word'
      });
    });

    it('maps the same keys from schema types (case-insensitive)', () => {
      const result = SwaggerSchema.extractSchemaFromSwagger(spec(), '/dates-schema', 'GET');
      assert.ok(result);
      assert.deepEqual(result.converted, {
        CreatedAt: 'date:-10',
        expiresAt: 'date:10',
        updatedAt: 'date:0',
        name: 'word'
      });
    });

    it('returns null for unrelated key names', () => {
      assert.equal(SwaggerSchema.dateTypeFromKeyName('createdAt'), 'date:-10');
      assert.equal(SwaggerSchema.dateTypeFromKeyName('expire_date'), 'date:10');
      assert.equal(SwaggerSchema.dateTypeFromKeyName('last_update'), 'date:0');
      assert.equal(SwaggerSchema.dateTypeFromKeyName('name'), null);
    });
  });

  describe('inferTypeFromExample', () => {
    it('maps numbers, booleans and plain strings', () => {
      assert.equal(SwaggerSchema.inferTypeFromExample(3), 'integer');
      assert.equal(SwaggerSchema.inferTypeFromExample(4.5), 'float');
      assert.equal(SwaggerSchema.inferTypeFromExample(true), 'boolean');
      assert.equal(SwaggerSchema.inferTypeFromExample('plain text'), 'word');
      assert.equal(SwaggerSchema.inferTypeFromExample(''), 'word');
      assert.equal(SwaggerSchema.inferTypeFromExample(null), 'word');
    });

    it('detects date, time, zip, url, ip, second and alphanumeric strings', () => {
      assert.equal(SwaggerSchema.inferTypeFromExample('2024-01-15'), 'date');
      assert.equal(SwaggerSchema.inferTypeFromExample('12:30'), 'time');
      assert.equal(SwaggerSchema.inferTypeFromExample('12:30 PM'), 'time');
      assert.equal(SwaggerSchema.inferTypeFromExample('12345-6789'), 'zipcode');
      assert.equal(SwaggerSchema.inferTypeFromExample('https://example.com'), 'url');
      assert.equal(SwaggerSchema.inferTypeFromExample('10.0.0.1'), 'ipaddress');
      assert.equal(SwaggerSchema.inferTypeFromExample('1700000000'), 'second');
      assert.equal(SwaggerSchema.inferTypeFromExample('abc123'), 'alphanumeric');
    });

    it('detects file-ish urls as image, pdf, csv and doc', () => {
      assert.equal(SwaggerSchema.inferTypeFromExample('https://cdn/x.png'), 'image');
      assert.equal(SwaggerSchema.inferTypeFromExample('https://cdn/x.pdf'), 'pdf');
      assert.equal(SwaggerSchema.inferTypeFromExample('https://cdn/x.csv'), 'csv');
      assert.equal(SwaggerSchema.inferTypeFromExample('https://cdn/x.docx'), 'doc');
    });

    it('infers nested objects', () => {
      assert.deepEqual(SwaggerSchema.inferSchemaFromExample({ a: 1, b: { c: 'user@example.com' } }), {
        a: 'integer',
        b: { c: 'email' }
      });
    });
  });

  describe('parseCurlCommand', () => {
    it('parses --url, -X method and --data-raw body', () => {
      const result = SwaggerSchema.parseCurlCommand(
        "curl --url 'http://localhost:9920/__route/save' -X POST -H 'Content-Type: application/json' --data-raw '{\"id\":\"\",\"name\":\"/list\",\"type\":\"POST\"}'"
      );
      assert.ok(result);
      assert.equal(result.method, 'POST');
      assert.equal(result.routeName, '/__route/save');
      assert.equal(result.hasBody, true);
      assert.equal(result.body, '{"id":"","name":"/list","type":"POST"}');
    });

    it('uses the first bare url token and -d implies POST', () => {
      const result = SwaggerSchema.parseCurlCommand(
        "curl 'https://api.example.com/api/v1/orders' -d '{\"sku\":\"abc\"}'"
      );
      assert.ok(result);
      assert.equal(result.method, 'POST');
      assert.equal(result.routeName, '/api/v1/orders');
      assert.equal(result.body, '{"sku":"abc"}');
    });

    it('defaults to GET without a body', () => {
      const result = SwaggerSchema.parseCurlCommand('curl http://localhost:9920/api/list');
      assert.ok(result);
      assert.equal(result.method, 'GET');
      assert.equal(result.routeName, '/api/list');
      assert.equal(result.hasBody, false);
    });

    it('keeps only the path, dropping origin and query string', () => {
      const result = SwaggerSchema.parseCurlCommand("curl 'http://localhost:9920/list?page=2'");
      assert.ok(result);
      assert.equal(result.routeName, '/list');
    });

    it('supports double-quoted bodies with escaped quotes', () => {
      const result = SwaggerSchema.parseCurlCommand(
        'curl -X PUT http://localhost:9920/users/1 -d "{\\"name\\":\\"John\\"}"'
      );
      assert.ok(result);
      assert.equal(result.method, 'PUT');
      assert.equal(result.routeName, '/users/1');
      assert.equal(result.body, '{"name":"John"}');
    });

    it('returns null for non-curl input', () => {
      assert.equal(SwaggerSchema.parseCurlCommand('/api/list'), null);
      assert.equal(SwaggerSchema.parseCurlCommand(''), null);
      assert.equal(SwaggerSchema.parseCurlCommand('  curlly text'), null);
    });
  });

  describe('planRouteUpserts', () => {
    const route = (name: string, type: string) => ({ name, type, schema: {} });

    it('splits route objects into create and update batches', () => {
      const existing = [
        { id: 'r1', name: '/list', type: 'GET' },
        { id: 'r2', name: '/list', type: 'POST' }
      ];
      const generated = [
        route('/list', 'GET'),
        route('/list', 'PUT'),
        route('/users', 'GET')
      ];

      const result = SwaggerSchema.planRouteUpserts(existing, generated);
      assert.strictEqual(result.toCreate.length, 2);
      assert.deepEqual(result.toCreate.map((r) => `${r.type} ${r.name}`), [
        'PUT /list',
        'GET /users'
      ]);

      assert.strictEqual(result.toUpdate.length, 1);
      assert.strictEqual(result.toUpdate[0].existing.id, 'r1');
      assert.strictEqual(result.toUpdate[0].route.type, 'GET');
    });

    it('treats method as part of the route identity', () => {
      const existing = [{ id: 'r1', name: '/list', type: 'GET' }];
      const result = SwaggerSchema.planRouteUpserts(existing, [route('/list', 'POST')]);
      assert.strictEqual(result.toCreate.length, 1);
      assert.strictEqual(result.toUpdate.length, 0);
    });

    it('handles empty and non-array input', () => {
      assert.deepEqual(SwaggerSchema.planRouteUpserts(null, [route('/x', 'GET')]), {
        toCreate: [{ name: '/x', type: 'GET', schema: {} }],
        toUpdate: []
      });
      assert.deepEqual(SwaggerSchema.planRouteUpserts([], null), { toCreate: [], toUpdate: [] });
    });
  });

  describe('convertSwaggerSchema', () => {
    it('maps primitive types and formats', () => {
      const spec = {};
      assert.equal(SwaggerSchema.convertSwaggerSchema({ type: 'integer' }, spec), 'integer');
      assert.equal(SwaggerSchema.convertSwaggerSchema({ type: 'number' }, spec), 'float');
      assert.equal(SwaggerSchema.convertSwaggerSchema({ type: 'boolean' }, spec), 'boolean');
      assert.equal(SwaggerSchema.convertSwaggerSchema({ type: 'string', format: 'ipv4' }, spec), 'ipaddress');
      assert.equal(SwaggerSchema.convertSwaggerSchema({ type: 'string', format: 'uri' }, spec), 'url');
      assert.equal(SwaggerSchema.convertSwaggerSchema({ type: 'string', format: 'unknown' }, spec), 'word');
    });

    it('keeps enum values as a fixed-value list', () => {
      assert.equal(
        SwaggerSchema.convertSwaggerSchema({ type: 'string', enum: ['a', 'b'] }, {}),
        'a|b'
      );
    });

    it('merges allOf parts', () => {
      const spec = {};
      const result = SwaggerSchema.convertSwaggerSchema(
        { allOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { type: 'object', properties: { b: { type: 'integer' } } }] },
        spec
      );
      assert.deepEqual(result, { a: 'word', b: 'integer' });
    });

    it('uses the first oneOf/anyOf branch', () => {
      const spec = {};
      const result = SwaggerSchema.convertSwaggerSchema(
        { oneOf: [{ type: 'string' }, { type: 'integer' }] },
        spec
      );
      assert.equal(result, 'word');
    });

    it('handles openapi 3.1 nullable type arrays', () => {
      assert.equal(
        SwaggerSchema.convertSwaggerSchema({ type: ['string', 'null'] }, {}),
        'word'
      );
      assert.equal(
        SwaggerSchema.convertSwaggerSchema({ type: ['null', 'integer'] }, {}),
        'integer'
      );
    });

    it('uses const as a fixed value', () => {
      assert.equal(
        SwaggerSchema.convertSwaggerSchema({ type: 'string', const: 'shipped' }, {}),
        'shipped'
      );
    });

    it('returns text for an unknown schema', () => {
      assert.equal(SwaggerSchema.convertSwaggerSchema({}, {}), 'word');
      assert.equal(SwaggerSchema.convertSwaggerSchema(null, {}), 'word');
    });
  });
});
