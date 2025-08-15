function showSchemaFormat() {
  const id = "code";
 
  const html = `/*************  return-Type   *******************/
  /****   id | uuid | boolean | text | title |  ***/
  /****   textarea | integer | float | phone |  ***/
  /****   zipcode | date | time | date-time |   ***/
  /****   url | email | image | pdf | csv |     ***/
  /****   doc |  ipaddress | second | alphanumeric */
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
  const element2 = document.getElementById("btn-2");

  element1.classList.add("selected-btn");
  element2.classList.remove("selected-btn");

  element2.children[0].classList.remove("nav-icon-white");
  element2.children[0].classList.remove("nav-icon-black");
  element2.children[0].classList.add("nav-icon-black");
}

function showSampleResponse() {
  const id = "code";
  let html = `
  /* sample response here */
`;

  document.getElementById(id).innerHTML = html

  const element1 = document.getElementById("btn-1");
  const element2 = document.getElementById("btn-2");

  element1.classList.remove("selected-btn");
  element2.classList.add("selected-btn");

  element2.children[0].classList.remove("nav-icon-black");
  element2.children[0].classList.remove("nav-icon-white");
  element2.children[0].classList.add("nav-icon-white");
  // nav-icon-black

  routeData.id !== "" && routeData.routeName !== "" && displaySampleData(routeData)
}

function showProjectNameInInput() {
  const projectId = "project-id";
  const projectName = "project-name";

  const { id, name, isActive } = getActiveProjectDetails();
  const element = document.getElementById("project-url-value");
  const fakeUrl = document.getElementById("fake-url").value;
  element.innerHTML = `${fakeUrl}${name}`;

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

  editor.setValue( "" );

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

async function inputSelector(event) {
  event.preventDefault();
  routeData.routeType = event.target.value;
  await saveRouteData (routeData);
}

async function baseUrlSelector(event) {
  event.preventDefault();
  routeData.routeName = event.target.value;
  await saveRouteData (routeData)
}

function makeReadOnly() {
  const routeTypeElement = document.getElementById(inputTypeSelectDivId);
  routeTypeElement.disabled = true;

  const routeNameElement = document.getElementById(baseUrlDivId);
  routeNameElement.disabled = true;
}

function updateRouteFormData(data) {
  const { _id: id, projectId, projectName, routeType, routeName, schema, options={} } = data || {};
  const routeTypeList = ["", "GET", "POST", "PUT", "DELETE", "PATCH"];

  const routeIdDivElement = document.getElementById(routeIdDiv);
  routeIdDivElement.value = id;
  const inputTypeSelectDivIdElement = document.getElementById(inputTypeSelectDivId);
  inputTypeSelectDivIdElement.value = routeType;
  inputTypeSelectDivIdElement.selectedIndex = routeTypeList.indexOf(routeType);

  const baseUrlDivIdElement = document.getElementById(baseUrlDivId);
  baseUrlDivIdElement.value = routeName;

  const newSchema = schema && schema !== "" ? JSON.stringify(schema, null, 2) : "";

  routeData.id = id;
  routeData.projectId = projectId;
  routeData.projectName = projectName;
  routeData.routeType = routeType;
  routeData.routeName = routeName;
  routeData.schema = newSchema;
  routeData.options = {};
  routeData.options.__auth = options?.__auth || false;

  editor.setValue( newSchema );
  makeReadOnly();
  setAuthCheckbox(routeData.options.__auth);
}

async function saveRouteData(routeData) {
  try {
    const { id=null, projectId, projectName, schema, routeName, routeType, options } = routeData;
    if( id &&  routeType && routeName  ) {
      const result  = await axios.put(`__route/update`, { id, schema, options })
      if(result.data) {
        showToastr("route is updated successfully :)")
      } else {
        showToastr("route cannot be updated :(")
      }
    } else if( routeType && routeName ) {
      const result =  await axios.post("__route/save", {  
        id, projectId, projectName, schema, routeName, routeType, options 
      });
      const { _id: routeId = ""} = result.data;
      routeData.id = routeId;
      document.getElementById(routeIdDiv).value = routeId;
      makeReadOnly();
      if( routeId !== "") {
        showToastr("route is created successfully :)");
      } else {
        showToastr("route cannot be created :(")
      }
    }

    await getProjectRouteList( projectId );
  }
  catch(err) {
    showToastr("internal server error :(");
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
