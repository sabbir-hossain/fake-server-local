# fake-server-local

## What is fake-server-local?
`fake server local` is a **local REST api server**
which return random lorem-ipsum data based on user schema. It might be helpful for 
**Front-end/App developers**, who don't have sufficient data (might be REST 
api is not ready or not enough data in database) to test their projects. All you need, 
just create an api endpoint and output schema. You will get your sufficient data to test your project.

## Technologies used
`Node.js, Express, TypeScript, EJS, JavaScript, HTML, CSS`

## Setup
- Clone this project (must have `node.js` installed in your machine )
- open project directory using terminal/Command Prompt
- run `npm install`
- run `npm start`
- now go to `http://localhost:9920/dashboard`
- create a project
- your fake api endpoint will be `http://localhost:9920/${your-project-title}`

> Project names `health-check`, `__project` and `__route` are **reserved** and cannot be created.

## Creating Fake Api
> Select `Route type` (`GET|POST|PUT|PATCH|DELETE`) and type your route name. Now your route will be  `http://localhost:9920/${your-project-title}/${your-route-name}`

> Now add output schema. Schema will be json object, which will be as like as given below

`return-Type` can be 

```
id | uuid | boolean | integer | float | phone | zipcode |
date | time | date-time | url | email | image | pdf | csv |
doc | ipaddress | token | second | alphanumeric | word | desc
```

| Type | Returns |
| --- | --- |
| `id` / `uuid` | a random UUID (v4) |
| `boolean` | `true` or `false` |
| `integer` / `int` | a random integer, e.g. `int:3` = 3 digits (default 3) |
| `float` | a random decimal, e.g. `float:3.2` = up to 3 integer digits + 2 decimals |
| `phone` | a phone number like `123-456-7890` |
| `zipcode` | a 5-digit zip code |
| `date` | a date, default format `DD/MM/YYYY` (supports offsets, see below) |
| `time` | a time like `7:43 PM` |
| `date-time` | an ISO date-time (supports offsets, see below) |
| `url` | a website URL |
| `email` | an email address |
| `image` / `pdf` / `csv` / `doc` | a URL to a random local asset of that type |
| `ipaddress` | an IPv4 address |
| `second` | the current epoch time in **milliseconds** |
| `alphanumeric` | a random mix of letters and digits |
| `word` | a random lowercase word |
| `desc` | a longer random text block |
| `token` | a JWT signed with the project secret (requires a `__property` payload) |

### date & date-time offsets
`date` and `date-time` accept an optional day offset after `:`. For `date`, the input is `format|offset` (the `|offset` part is optional):

```
"date"                    -> today, format DD/MM/YYYY
"date:5"                  -> 5 days in the future, default format
"date:-5"                 -> 5 days in the past, default format
"date:YYYY-MM-DD|-2"      -> custom format, 2 days in the past
"date:MM/DD/YY"           -> custom format, today
"date-time" | "date-time:0" -> today with a random time
"date-time:3"             -> 3 days in the future with a random time
"date-time:-2"            -> 2 days in the past with a random time
```

Supported format tokens: `DD` (day), `MM` (month), `YYYY` (year), `YY` (2-digit year).

### Fixed values & random options
- `"country": "Bangladesh"` — returned exactly as written.
- `"status": "active|inactive|pending"` — one of the values is picked at random (separator is `|`).

> Commas are **not** a separator — `"a,b,c"` is returned literally. Use `|` for options.

### Chaining types with `>`
Types chained with `>` are concatenated into a single string:

```
"01>5|6|7|8|9>int:8"   -> starts with "01", then a random digit from 5-9, then an 8-digit number
"pre->uuid"            -> "pre-" followed by a UUID
```

> Because `>` concatenates, `date` uses `|` (not `>`) for its format/offset separator.

### Schema example

```JSON
{
  "original-response-key-01": "return-Type",
  "original-response-key-02": ["return-Type"],
  "original-response-key-03": "any fixed value",
  "original-response-key-04": "value-from-fixed-option-01|value-from-fixed-option-02|value-from-fixed-option-03",
  "original-response-key-05": {
    "original-child-response-key-01": "return-Type",
    "original-child-response-key-02": ["return-Type"],
    "original-child-response-key-03": "any fixed value",
    "original-child-response-key-04": "value-from-fixed-option-01|value-from-fixed-option-02",
    "original-child-response-key-05": {
      "can-be-more-nested-key-01": "return-Type"
    }
  },
  "original-response-key-06": {
    "__type": "return-Type"
  },
  "original-response-key-07": {
    "__type": "array",
    "__range": "can-be-number|can-be-number-range",
    "__property": "return-Type"
  },
  "original-response-key-08": {
    "__type": "array",
    "__range": "can-be-number|can-be-number-range",
    "__property": {
      "original-array-property-01": "return-Type"
    }
  },
  "original-token-property-09": {
    "__type": "token",
    "__property": {
       "token-key-01": "return-Type",
       "token-key-02": "return-Type"
    }
  }
}
```

## Upload an OpenAPI / Swagger file
After clicking **"add new route"**, the **Upload OpenAPI** option becomes available. Upload a `.yaml`, `.yml` or `.json` file (Swagger 2.0 or OpenAPI 3.x) and every operation becomes a route:

- **Route name** comes from the path, **method** from the operation.
- **Schema** is generated in this priority:
  1. file media types: `application/pdf` -> `pdf`, `text/csv` -> `csv`, `image/*` -> `image`
  2. the 200 response `example` values (types are inferred from the actual values)
  3. the `requestBody` schema (POST/PUT/PATCH)
  4. the response schema, or the first schema in the file

## Edge cases & gotchas
- **Unknown types become fixed values** — anything that isn't a known return-type is returned literally.
- **Empty schema** — `{}` produces an empty object `{}`.
- **`"__auth"` keys are skipped** in the generated output (internal auth flag).
- **Removed types** — `text`, `title` and `textarea` no longer exist; use `word` and `desc` instead.
- **Comma vs pipe** — options must be separated with `|`; commas are kept literally.
- **File URLs** — `image`, `pdf`, `csv` and `doc` return URLs that point to this server's `/assets` folder.

### Sample 

![alt text](https://raw.githubusercontent.com/shsaucorp/fake-server-local/master/public/assets/images/help-page/token-values.png) ![alt text](https://raw.githubusercontent.com/shsaucorp/fake-server-local/master/public/assets/images/help-page/array-values.png) 

![alt text](https://raw.githubusercontent.com/shsaucorp/fake-server-local/master/public/assets/images/help-page/array-values-2.png) 
