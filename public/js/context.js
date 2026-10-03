function showSchemaFormat() {
  const id = "code";

  const html = `/*************  return-Type   *******************/
  /****   id | uuid | boolean | integer | float |  ***/
  /****   phone | zipcode | date | time | date-time ***/
  /****   url | email | image | pdf | csv | doc |  ***/
  /****   ipaddress | second | alphanumeric |     ***/
  /****                                            ***/
  /****   date & date-time accept a day offset:    ***/
  /****   "date" | "date:5" | "date:DD/MM/YYYY|-2" ***/
  /****   "date-time:3" (0=today, +future, -past)  ***/
  /************************************************/
  {
    "variable-1": "return-Type",
    "variable-2": "fixed-value-1,fixed-value-1",
    "single-Array-Variable": ["return-Type"],
    "object-Variable": {
      "variable-11": "return-Type"
      // add variables
    },
    "array-Object-Variable-1": [{
      "variable-22": "return-Type"
      // add variables
    }],
    "variable-3": {
      "__type": "return-Type"
    },
    "variable-4":  "fixed value",
    "array-Of-Array-Variable-1": [ ["return-Type"] ],
    "array-Object-Variable-1": {
      "__type": "array",
      "__range": "array-length" // number|(min,max)
      "__property": {
        "variable-33": "return-Type"
        // add variables
      }
    }
  }`;

  document.getElementById(id).innerHTML = html;

  const element1 = document.getElementById("btn-1");
  const element2 = document.getElementById("show-sample-data");

  element1.classList.add("selected-btn");
  element2.classList.remove("selected-btn");

  element2.children[0].classList.remove("nav-icon-white");
  element2.children[0].classList.remove("nav-icon-black");
  element2.children[0].classList.add("nav-icon-black");

  const stringifyBtn = document.getElementById("btn-stringify");
  const beautifyBtn = document.getElementById("btn-beautify");
  stringifyBtn.disabled = true;
  beautifyBtn.disabled = true;
  stringifyBtn.classList.remove("json-active");
  beautifyBtn.classList.remove("json-active");
}

function showSampleResponse() {
  const id = "code";
  let html = `
  /* sample response here */
`;

  document.getElementById(id).innerHTML = html

  const element1 = document.getElementById("btn-1");
  const element2 = document.getElementById("show-sample-data");

  element1.classList.remove("selected-btn");
  element2.classList.add("selected-btn");

  element2.children[0].classList.remove("nav-icon-black");
  element2.children[0].classList.remove("nav-icon-white");
  element2.children[0].classList.add("nav-icon-white");
  // nav-icon-black

  const stringifyBtn = document.getElementById("btn-stringify");
  const beautifyBtn = document.getElementById("btn-beautify");
  stringifyBtn.disabled = false;
  beautifyBtn.disabled = false;
  stringifyBtn.classList.add("json-active");
  beautifyBtn.classList.add("json-active");

  routeData.id !== "" && routeData.routeName !== "" && displaySampleData(routeData)
}

function stringifyJson() {
  const code = document.getElementById("code");
  try {
    const parsed = JSON.parse(code.textContent || "");
    code.textContent = JSON.stringify(parsed);
  } catch (error) {
    showToastr("invalid json :(");
  }
}

function beautifyJson() {
  const code = document.getElementById("code");
  try {
    const parsed = JSON.parse(code.textContent || "");
    code.textContent = JSON.stringify(parsed, null, 2);
  } catch (error) {
    showToastr("invalid json :(");
  }
}

function showProjectNameInInput() {
  const projectId = "project-id";
  const projectName = "project-name";

  const { id, name } = getActiveProjectDetails();
  const element = document.getElementById("project-url-value");
  const fakeUrl = document.getElementById("fake-url").value;
  element.innerHTML = `${fakeUrl}${name.length > 0 ? `/${name}` : "" }`;

  const projectIdElement = document.getElementById(projectId);
  projectIdElement.value = id;
  routeData.projectId = id;

  const projectNameElement = document.getElementById(projectName);
  projectNameElement.value = name;
  routeData.projectName = name;

  routeData.schema = "";
  routeData.routeType = "";
  routeData.routeName = "";
  routeData.id = "";

  window.editor.setValue( "" );

  const routeIdElement = document.getElementById(routeIdDiv);
  routeIdElement.value = "";

  const routeTypeElement = document.getElementById(inputTypeSelectDivId);
  routeTypeElement.selectedIndex = 0;
  routeTypeElement.value = "";
  routeTypeElement.disabled = false;

  const routeNameElement = document.getElementById(baseUrlDivId);
  routeNameElement.value = "";
  routeNameElement.disabled = false;

  const selectedRoute = document.querySelector('.route-title-selected');
  selectedRoute && selectedRoute.classList.remove('route-title-selected');
}

function setSwaggerUploadEnabled(enabled) {
  const input = document.getElementById("swagger-file-input");
  const label = document.querySelector(".swagger-upload-label");
  if (input) {
    input.disabled = !enabled;
  }
  if (label) {
    label.classList.toggle("is-disabled", !enabled);
  }
}

function handleAddNewRouteClick() {
  showProjectNameInInput();
  setSwaggerUploadEnabled(true);
}

async function inputSelector(event) {
  event.preventDefault();
  routeData.routeType = event.target.value;
  await saveRouteData(routeData);
}

async function baseUrlSelector(event) {
  event.preventDefault();
  const rawValue = event.target.value.trim();

  const parsedCurl = SwaggerSchema.parseCurlCommand(rawValue);
  if (parsedCurl) {
    await handlePastedCurl(parsedCurl, event.target);
    return;
  }

  routeData.routeName = rawValue;
  await saveRouteData (routeData)
}

async function handlePastedCurl(parsedCurl, routeNameElement) {
  try {
    const supportedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    const method = supportedMethods.indexOf(parsedCurl.method) !== -1
      ? parsedCurl.method
      : "GET";

    const routeTypeElement = document.getElementById(inputTypeSelectDivId);
    routeTypeElement.value = method;
    routeTypeElement.selectedIndex = Array.prototype.findIndex.call(
      routeTypeElement.options,
      (option) => option.value === method
    );

    // route name = URL path only
    routeNameElement.value = parsedCurl.routeName;

    // generate the schema from the curl request body, re-using the
    // swagger example-inference code
    let schema = {};
    if (parsedCurl.hasBody) {
      try {
        const bodyJson = JSON.parse(parsedCurl.body);
        if (Array.isArray(bodyJson)) {
          schema = {
            __type: "array",
            __range: "10,15",
            __property: bodyJson.length > 0
              ? SwaggerSchema.inferTypeFromExample(bodyJson[0])
              : "word"
          };
        } else {
          schema = SwaggerSchema.inferSchemaFromExample(bodyJson);
        }
      } catch (error) {
        schema = {};
      }
    }

    routeData.routeName = parsedCurl.routeName;
    routeData.routeType = method;
    routeData.schema = schema;

    window.editor.setValue(JSON.stringify(schema, null, 2));
    await saveRouteData(routeData);
    showToastr(`route ${method} ${parsedCurl.routeName} generated from curl :)`);
  } catch (error) {
    console.error(error);
    showToastr(error?.response?.data?.message || "invalid curl command :(");
  }
}

function makeReadOnly() {
  const routeTypeElement = document.getElementById(inputTypeSelectDivId);
  routeTypeElement.disabled = true;

  const routeNameElement = document.getElementById(baseUrlDivId);
  routeNameElement.disabled = true;
}

function updateRouteFormData(data) {
  const { id, projectId, projectName, type, name, schema, options={} } = data || {};
  const routeTypeList = ["", "GET", "POST", "PUT", "DELETE", "PATCH"];

  const routeIdDivElement = document.getElementById(routeIdDiv);
  routeIdDivElement.value = id;
  const inputTypeSelectDivIdElement = document.getElementById(inputTypeSelectDivId);
  inputTypeSelectDivIdElement.value = type;
  inputTypeSelectDivIdElement.selectedIndex = routeTypeList.indexOf(type);

  const baseUrlDivIdElement = document.getElementById(baseUrlDivId);
  baseUrlDivIdElement.value = name;

  const newSchema = schema && schema !== "" ? JSON.stringify(schema, null, 2) : "";

  routeData.id = id;
  routeData.projectId = projectId;
  routeData.projectName = projectName;
  routeData.routeType = type;
  routeData.routeName = name;
  routeData.schema = newSchema;
  routeData.options = {};
  routeData.options.__auth = options?.__auth || false;

  window.editor.setValue( newSchema );
  makeReadOnly();
  setAuthCheckbox(routeData.options.__auth);
  setSwaggerUploadEnabled(false);
}

async function saveRouteData(routeData) {
  try {
    const { id=null, projectId, projectName, schema, routeName, routeType, options } = routeData;
    if( id &&  routeType && routeName && schema  ) {
      // /__project/:projectId/route/:routeId/update
      const result  = await axios.put(`__project/${projectId}/route/${id}/update`, {
        schema,
        options,
        name: routeName,
        type: routeType,
      })
      if(result.data) {
        showToastr("route is updated successfully :)");
        await getProjectRouteList( projectId );
      } else {
        showToastr("route cannot be updated :(")
      }
    } else if( routeType && routeName && schema ) {
      // name, type, schema
      const result =  await axios.post("__route/save", {
        id,
        projectId,
        projectName,
        schema,
        name: routeName,
        type: routeType,
        options
      });
      const { id: routeId = ""} = result.data;
      routeData.id = routeId;
      document.getElementById(routeIdDiv).value = routeId;
      makeReadOnly();
      if( routeId !== "") {
        showToastr("route is created successfully :)");
        await getProjectRouteList( projectId );
      } else {
        showToastr("route cannot be created :(")
      }
    }
  }
  catch(err) {
    console.error(err);
    showToastr(err?.response?.data?.message || "Internal server error :(");
  }
}

async function handleAuth(event) {
  routeData.options = {};
  routeData.options.__auth = event.checked;
  if(routeData.schema && routeData.schema !== "") {
    routeData.schema = JSON.parse(routeData.schema)
  }
  await saveRouteData(routeData);
}

function setAuthCheckbox(value) {
  const id = "isAuthenticate";
  document.getElementById(id).checked = value;
}

async function displaySampleData(data) {
  try {
    const result =  await axios({
      method: `${data.routeType}`,
      url: `${data.projectName}${data.routeName}`,
      headers: {
        "Authorization": "auth-data",
        "Content-Type": "application/json"
      }
    })

    const id = "code";
    let html = JSON.stringify( (result.data || {}), null, 3 );
    document.getElementById(id).innerHTML = html
  }
  catch(error) {
    console.error(error);
  }
}

/* ------------------------- Swagger upload ------------------------- */

async function handleSwaggerUpload(event) {
  const fileInput = event.target;
  const file = fileInput.files && fileInput.files[0];
  if (!file) {
    return;
  }

  try {
    const content = await file.text();
    const spec = SwaggerSchema.parseSwaggerFile(content);

    const operations = SwaggerSchema.listOperations(spec);
    if (!operations.length) {
      showToastr("no routes found in the uploaded file :(");
      return;
    }

    // Build one route object per operation:
    // name = path, type = method, schema = inferred from the response
    // example values (falling back to request/response schema types).
    const routeObjects = operations
      .map((op) => {
        const extracted = SwaggerSchema.extractSchemaFromSwagger(
          spec,
          op.path,
          op.method,
          Boolean(op.operation.requestBody)
        );
        return {
          name: op.path,
          type: op.method,
          schema: (extracted && extracted.converted) || {}
        };
      })
      .filter((routeObj) => routeObj.schema && Object.keys(routeObj.schema).length > 0);

    console.log('routeObjects---> ', routeObjects);

    if (!routeObjects.length) {
      showToastr("no schema found in the uploaded file :(");
      return;
    }

//     // Save every generated route for the current project. When a route with
    // the same name & method already exists, update it instead of creating
    // a duplicate.
    const { projectId, projectName } = routeData;
    const existingRoutesResult = await axios.get(`/__route/${projectId}/list`);
    const existingRoutes = existingRoutesResult.data || [];

    const { toCreate, toUpdate } = SwaggerSchema.planRouteUpserts(existingRoutes, routeObjects);

    await Promise.all([
      ...toCreate.map((routeObj) =>
        axios.post("__route/save", {
          id: "",
          projectId,
          projectName,
          schema: routeObj.schema,
          name: routeObj.name,
          type: routeObj.type,
          options: {}
        })
      ),
      ...toUpdate.map(({ existing, route: routeObj }) =>
        axios.put(`__project/${projectId}/route/${existing.id}/update`, {
          ...existing,
          id: existing.id,
          schema: routeObj.schema,
          name: routeObj.name,
          type: routeObj.type,
          options: existing.options || {}
        })
      )
    ]);

    // Fill the form with the first generated route
    const first = routeObjects[0];
    const routeNameElement = document.getElementById(baseUrlDivId);
    routeNameElement.value = first.name;

    const routeTypeElement = document.getElementById(inputTypeSelectDivId);
    routeTypeElement.value = first.type;
    routeTypeElement.selectedIndex = Array.prototype.findIndex.call(
      routeTypeElement.options,
      (option) => option.value === first.type
    );

    routeData.routeName = first.name;
    routeData.routeType = first.type;
    routeData.schema = first.schema;

    window.editor.setValue(JSON.stringify(first.schema, null, 2));

    await getProjectRouteList(projectId);

    const parts = [];
    if (toCreate.length > 0) parts.push(`${toCreate.length} created`);
    if (toUpdate.length > 0) parts.push(`${toUpdate.length} updated`);
    showToastr(`route(s) ${parts.join(" & ")} from the uploaded file :)`);
  } catch (error) {
    console.error(error);
    showToastr(error?.response?.data?.message || "invalid OpenAPI file :(");
  } finally {
    fileInput.value = "";
  }
}
