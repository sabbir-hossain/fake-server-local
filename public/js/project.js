const dataName = "data-input-name";
const dataId = "data-input-id";
const dataActive = "data-input-active";
const toggleAppListDivId = "toggle-app-list"; 
const appTitleDivId = "app-title-id";
const otherProjectDivId = "other-project-list";
const otherProjectSaveDivId = "other-project-name";
const activeProjectDivId = "active-project-id";
const routeListDivId="route-list-id";
const projectIdAttr = "data-project-id";
const routeIdAttr = "data-route-id";
const activeProjectInputDiv = "active-project-input";
const otherProjectInputDiv = "other-project-input";
const newProjectInputDiv = "new-project-input";
const newProjectSaveBtnId = "new-project-save";
let editingProjectId = null;

const dataAttributeObj = {
  [`${dataName}`]: "name",
  [`${dataId}`]: "id",
  [`${dataActive}`]: "status"
};

const inputTypeSelectDivId = "inputTypeSelect";
const baseUrlDivId = "basic-url";
const schemaDivId = "documentTextarea";
const routeIdDiv = "route-id";
let routeData = {};

const contextEventList = [
  {
    identifier: inputTypeSelectDivId, 
    name: "change",
    functionReference: inputSelector 
  },
  {
    identifier: baseUrlDivId,
    name: "blur",
    functionReference: baseUrlSelector
  }
];

document.addEventListener("DOMContentLoaded", async (event) => {
  event.preventDefault();
  window.editor = ace.edit("documentTextarea")
  window.editor.resize()
  window.editor.getSession().setMode("ace/mode/json")
  window.editor.setTheme("ace/theme/monokai")
  window.editor.setFontSize(12)
  window.editor.focus();

  // Keep the editor filling its container on any window/browser resize
  window.addEventListener("resize", function() {
    if (window.editor) {
      window.editor.resize();
    }
  });

  window.editor.on("blur", async function(event) {
    event.preventDefault();
    try {
      const schema = window.editor.getValue();
      if( schema !== "" ) {
        const schemaJson = JSON.parse(schema);
        const dbSchemaData = JSON.parse(routeData.schema || "{}");
        if(
          typeof dbSchemaData === 'object' && 
          (dbSchemaData !== null 
            ||  Object.keys(dbSchemaData).length === 0 ) 
            && checkObject( schemaJson, dbSchemaData) 
        ) {
            return;
        } else {
          routeData.schema = schemaJson;
          await saveRouteData (routeData)
        }
      }
    }
    catch(error) {
      console.error("error", error);
      showToastr("something went wrong :(", 3000, "error")
    }
  });


  document.getElementById("show-sample-data").addEventListener("click", (evt) => {
    evt.preventDefault();
    showSampleResponse();
  });

  document.getElementById("btn-1").addEventListener("click", (evt) => {
    evt.preventDefault();
    showSchemaFormat();
  });

  document.getElementById("isAuthenticate").addEventListener("change", (evt) => {
    handleAuth(evt.target);
  });

  document.getElementById("btn-stringify").addEventListener("click", (evt) => {
    evt.preventDefault();
    stringifyJson();
  });

  document.getElementById("btn-beautify").addEventListener("click", (evt) => {
    evt.preventDefault();
    beautifyJson();
  });

  const swaggerFileInput = document.getElementById("swagger-file-input");
  if (swaggerFileInput) {
    swaggerFileInput.addEventListener("change", handleSwaggerUpload);
  }

  createEventListener( contextEventList );

  showSchemaFormat();
  await initFunction();
});