
  const reservedProjectNames = ['health-check', '__project', '__route'];

  function isReservedProjectName(name) {
    return reservedProjectNames.includes(name);
  }

  function showInactiveProjectList(projects) {
    const othersProjectElement = document.getElementById(otherProjectDivId);
    const { htmlObjectList, eventObjList } = generateOtherProjectList(projects);
    removeAllChildElement( othersProjectElement );
    createHtmlChildElement( othersProjectElement, htmlObjectList.childElement );
    createEventListener( eventObjList );
  }

  async function getProjectRouteList( projectId ) {
    if( !projectId ) {
      return;
    }
    const response = await axios.get(`/__route/${projectId}/list`);
    const {htmlObjectList, eventObjList} = generateRouteList(response.data || []);
    const routeElement = document.getElementById(routeListDivId);
    removeAllChildElement( routeElement );
    createHtmlChildElement( routeElement, htmlObjectList.childElement );
    createEventListener( eventObjList );
    //  let { id, projectId, type, name } of routes
    const activeRoute = response.data && response.data.find( route => route.selected ) || {};
    const { id: routeId } = activeRoute;
    routeId && loadRouteDetails(projectId, routeId);
  }

  function handleAppUpdateCloseClick(event) {
    event.preventDefault();  
    const targetElement = event.target;

    const {name, id, isActive} = getDataAttributes(targetElement, dataAttributeObj)
    const element = searchElementByAttribute(targetElement, { id: activeProjectDivId });

    let { htmlObject, eventList } = createAppTitleObject( { id, name, isActive } ); 

    removeAllChildElement( element );

    createHtmlChildElement( element, htmlObject.childElement );
    createEventListener( eventList );
  }

  function generateAppEditInput(event) {
    event.preventDefault();
    let titleElement = event.target.parentNode.parentNode;

    const { name, id, isActive } = getDataAttributes( event.target, dataAttributeObj)
    const { htmlObject, eventList } = generateInputField( titleElement, { name, id, isActive  });
   
    removeAllChildElement( titleElement);
    titleElement.appendChild(createHtmlElement(htmlObject));
    createEventListener( eventList );
  }

  function toggleAppList(event) {
    event.preventDefault();
    const element = document.getElementById(otherProjectDivId);
    if (element) {
      element.classList.toggle("is-visible");
    }
    const toggle = document.getElementById(toggleAppListDivId);
    if (toggle) {
      toggle.classList.toggle("is-rotated");
    }
  }

  function generateRouteList(routes) {
    const childElementList = [];
    const eventObjList = [];
    const addNewRoute = "add-new-route";
    childElementList.push({
      name: "li",
      attributes: {
        class: "route-list",
      },
      childElement: [
        {
          name: "button",
          attributes: {
            class: "fake-btn",
            id: addNewRoute
          },
          childElement: [
            {
              name: "img",
              attributes: {
                src: "/assets/icons/plus.svg",
                class: "nav-icon-white btn-icon"
              } 
            },
            {
              name: "span",
              text: "add new route",
              attributes: {
                class: "btn-txt"
              }
            },
          ]
        }
      ]
    });

    eventObjList.push(
      {
        identifier: addNewRoute,
        functionReference: handleAddNewRouteClick
      }
    )

    for( let { id, projectId, type, name } of routes ) {
      childElementList.push({
        name: "li",
        attributes: {
          class: "route-list",
        },
        childElement: [
          {
            name: "div",
            attributes: {
              id: id,
              class: "route-title",
              [`${projectIdAttr}`]: projectId,
              [`${routeIdAttr}`]: id
            },
            childElement: [
              {
                name: "span",
                text: type,
                attributes: {
                  class: "route-type"
                }
              },
              {
                name: "span",
                text: truncateName(name),
                attributes: {
                  class: "route-name",
                  "data-tooltip": name
                }
              }
            ]
          },
          {
            name: "img",
            attributes: {
              id: `trash#${id}`,
              src: "/assets/icons/trash.svg",
              class: "nav-icon-black icon-right",
              [`${projectIdAttr}`]: projectId,
              [`${routeIdAttr}`]: id
            } 
          }
        ]
      });

      eventObjList.push({
        identifier: id, 
        functionReference: handleShowRouteDetailsClick 
      }, {
        identifier: `trash#${id}`,
        functionReference: handleRemoveRouteClick
      });
    }

    return { htmlObjectList: { childElement: childElementList }, eventObjList }
  } 

  function truncateName( name = "", maxLength = 50 ) {
    if (name.length <= maxLength) {
      return name;
    }
    return `...${name.slice(-maxLength)}`;
  } 

  function generateOtherProjectList( projects ) {
    const  childElementList = [];
    const eventObjList = [];

    // First row: create/edit project input + save button
    childElementList.push({
      name: "li",
      attributes: {
        class: "project-create-row"
      },
      childElement: [
        {
          name: "input",
          attributes: {
            type: "text",
            id: newProjectInputDiv,
            class: "project-input",
            placeholder: "Add new project"
          }
        },
        {
          name: "button",
          attributes: {
            class: "project-save-btn",
            id: newProjectSaveBtnId,
            title: "Save"
          },
          childElement: [
            {
              name: "img",
              attributes: {
                src: "/assets/icons/checkmark.svg",
                class: "project-icon"
              }
            }
          ]
        }
      ]
    });

    eventObjList.push({
      identifier: newProjectSaveBtnId,
      functionReference: handleProjectSaveClick
    });

    for( let i=0, len=projects.length; i<len; i++ ) {
      let { id, name } = projects[i];
      const divId =  `other-app-id-${i}`;
      const nameId =  `project-name-${i}`;
      const editId =  `edit#${id}`;
      const deleteId =  `delete#${id}`;

      childElementList.push({
        name: "li",
        attributes: {
          class: "other-app-title",
          id: divId
        },
        childElement: [
          {
            name: "span",
            text: truncateName(name),
            attributes: {
              class: "project-name",
              id: nameId,
              [`${dataId}`]: id,
              ...(name.length > 50 ? { "data-tooltip": name } : {})
            }
          },
          {
            name: "button",
            attributes: {
              class: "project-action-btn",
              title: "Edit"
            },
            childElement: [
              {
                name: "img",
                attributes: {
                  id: editId,
                  src: "/assets/icons/edit.svg",
                  class: "project-icon",
                  [`${dataId}`]: id,
                  [`${dataName}`]: name
                }
              }
            ]
          },
          {
            name: "button",
            attributes: {
              class: "project-action-btn",
              title: "Delete"
            },
            childElement: [
              {
                name: "img",
                attributes: {
                  id: deleteId,
                  src: "/assets/icons/trash.svg",
                  class: "project-icon",
                  [`${dataId}`]: id,
                  [`${dataName}`]: name
                }
              }
            ]
          }
        ]
      });

      eventObjList.push({
        identifier: nameId,
        functionReference: handleAppSwitchClick
      });
      eventObjList.push({
        identifier: editId,
        functionReference: handleProjectEditClick
      });
      eventObjList.push({
        identifier: deleteId,
        functionReference: handleProjectDeleteClick
      });
    }

    return { htmlObjectList: { childElement: childElementList }, eventObjList }
  }

  async function handleCreateNewProjectClick(event) {
    event.preventDefault();
    const targetElement = event.target;
    const isActive = false;

    const searchObj = {
      className: "input-field",
      nodeName: "INPUT"
    };
    
    const element = document.getElementById(otherProjectInputDiv);
    const titleValue = element.value.trim();
    if( isReservedProjectName(titleValue) ) {
      showToastr(`Project name "${titleValue}" is reserved :(`);
      return;
    }
    if( titleValue && titleValue.length > 0 ) {
      const response = await axios.post(`/__project/create`, { name: titleValue, isActive });
      const { id} = response.data;
      if( id ) {
        showToastr("project is created successfully :)");
      }

      const result =  await axios.get(`/__project/list?isActive=${isActive}`)
      const projectList = result.data || [];
      showInactiveProjectList(projectList);
    } else {
      showToastr("project title cannot be empty :(");
    }
  }

  async function handleProjectSaveClick(event) {
    event.preventDefault();
    const input = document.getElementById(newProjectInputDiv);
    const titleValue = input ? input.value.trim() : "";
    if (!titleValue) {
      showToastr("project title cannot be empty :(");
      return;
    }
    if (isReservedProjectName(titleValue)) {
      showToastr(`Project name "${titleValue}" is reserved :(`);
      return;
    }
    try {
      if (editingProjectId) {
        await axios.put(`/__project/${editingProjectId}/update`, { name: titleValue });
        showToastr("project is updated successfully :)");
      } else {
        await axios.post(`/__project/create`, { name: titleValue });
        showToastr("project is created successfully :)");
      }
      editingProjectId = null;
      if (input) input.value = "";
      await refreshProjectList();
    } catch (error) {
      console.error(error);
      showToastr(error?.response?.data?.message || "Something went wrong :(");
    }
  }

  function handleProjectEditClick(event) {
    event.preventDefault();
    const mapObj = {
      "data-input-id": "id",
      "data-input-name": "name"
    };
    const { id, name } = getDataAttributes(event.target, mapObj);
    const input = document.getElementById(newProjectInputDiv);
    if (input) {
      input.value = name || "";
      input.focus();
    }
    editingProjectId = id || null;
  }

  async function handleProjectDeleteClick(event) {
    event.preventDefault();
    const mapObj = {
      "data-input-id": "id",
      "data-input-name": "name"
    };
    const { id, name } = getDataAttributes(event.target, mapObj);
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      return;
    }
    try {
      await axios.delete(`/__project/${id}/delete`);
      showToastr("project is deleted successfully :)");
      editingProjectId = null;
      await refreshProjectList();
    } catch (error) {
      console.error(error);
      showToastr(error?.response?.data?.message || "Something went wrong :(");
    }
  }

  async function refreshProjectList() {
    const { id: projectId, otherProjects = [] } = await getProjectList();
    await initializeData(projectId, otherProjects);
    const listElement = document.getElementById(otherProjectDivId);
    if (listElement) {
      listElement.classList.add("is-visible");
    }
    const toggle = document.getElementById(toggleAppListDivId);
    if (toggle) {
      toggle.classList.add("is-rotated");
    }
  }

  async function handleShowRouteDetailsClick(event) {
    event.preventDefault();
    const target = event.currentTarget;

    const selectedRoute = document.querySelector('.route-title-selected');
    selectedRoute && selectedRoute.classList.remove('route-title-selected');
    target.classList.toggle("route-title-selected");

    const mapObj = {
      "data-project-id": "projectId",
      "data-route-id": "routeId"
    }

    const { projectId, routeId } = getDataAttributes(target, mapObj)

    loadRouteDetails(projectId, routeId);
  }

  async function loadRouteDetails(projectId, routeId) {
    if( !projectId || !routeId ) {
      return;
    }
    const result = await axios.get(`/__project/${projectId}/route/${routeId}`);
    const routeData = result.data || {};
    updateRouteFormData(routeData);
  }

  async function handleRemoveRouteClick(event) {
    event.preventDefault();
    const mapObj = {
      "data-project-id": "projectId",
      "data-route-id": "routeId"
    }
    const { projectId, routeId } = getDataAttributes(event.target, mapObj);
    routeId && axios.delete(`/__project/${projectId}/route/${routeId}/delete`)
      .then(resp => {
        getProjectRouteList( projectId );
        showProjectNameInInput();
      })
      .catch(err => {
        console.error(err);
      })
  }

  async function handleAppSwitchClick(event) {
    event.preventDefault();
    const mapObj = {
      "data-input-id": "id"
    }
    const { id:switchAppId } = getDataAttributes(event.target, mapObj);
    if( !switchAppId ) {
      return;
    }
    const response = await axios.put(`/__project/${switchAppId}/switch`);
    const { projectList = [] } = response.data || {};

    const { id:projectId, otherProjects } = await setupProjectData(projectList);
    await initializeData(projectId, otherProjects);

    const projectListElement = document.getElementById(otherProjectDivId);
    if (projectListElement) {
      projectListElement.classList.remove("is-visible");
    }
  }

  function createAppTitleObject( { name, id, isActive } ) {
    const htmlObject = {
      childElement: [
        {
          name: "div",
          attributes: {
            class: "app-title"
          },
          childElement: [
            {
              name: "div",
              text: truncateName(name),
              attributes: {
                id: appTitleDivId,
                [`${dataId}`]: id,
                [`${dataActive}`]: isActive,
                [`${dataName}`]: name,
                ...(name.length > 50 ? { "data-tooltip": name } : {})
              }
           }
          ]
        },
        {
          name: "img",
          attributes: {
            src: "/assets/icons/chevron-bottom.svg",
            class: "nav-icon-white app-list-toggle",
            id: toggleAppListDivId
          } 
        }
      ]
    };

    const eventList = [
      {
        identifier: toggleAppListDivId, 
        functionReference: toggleAppList 
      },
      {
        identifier: appTitleDivId, 
        functionReference: toggleAppList 
      },
      /*
      {
        identifier: appTitleDivId, 
        functionReference: generateAppEditInput 
      } 
      */
    ];
 
    return { htmlObject, eventList };
  }
  
  function getActiveProjectDetails() {
    const mapObj = {
      "data-input-id": "id",
      "data-input-active": "isActive",
      "data-input-name": "name"
    }

    const activeProjElement = document.getElementById(appTitleDivId);
    return getDataAttributes(activeProjElement, mapObj);
  }

  function generateInputField( {name="", isActive=false} ) {
    const closeDivId= "app-title-input-close";
    const updateAppTitleDivId = "app-title-input-okay";
    const htmlObject = {
      name: "div",
      attributes: {
        class:  "input-group"  
      },
      childElement: [
        {
          name: "input",
          attributes: {
            type: "text",
            value: name,
            class: "input-field",
            placeholder: "Add new Project",
            id: activeProjectInputDiv
          }
        }, 
        {
          name:"div",
          attributes: {
            class: "input-group-append"
          },
          childElement: [
            {
              name: "button",
              attributes: {
                class: "btn btn-outline-secondary",
                id: updateAppTitleDivId,
                [`${dataActive}`]: isActive
              },
              childElement: [
                {
                  name: "img",
                  attributes: {
                    src: "/assets/icons/checkmark.svg",
                    class: "nav-icon-black",
                    [`${dataActive}`]: isActive
                  }
                }
              ]
            }
          ]
        }
      ] 
    };
    const eventList = [
      {
        identifier: updateAppTitleDivId,
        functionReference: handleProjectCreateClick
      }
    ];
    
    return { htmlObject, eventList };
  }

  async function handleProjectCreateClick(event) {
    event.preventDefault();
    const targetElement = event.target;
    let { isActive:projActive } = getDataAttributes( targetElement, dataAttributeObj);

    const searchObj = {
      className: "input-field",
      nodeName: "INPUT"
    };

    projActive = projActive === "true";
    const element = document.getElementById(activeProjectInputDiv);
    const titleValue = element.value.trim();

    if( isReservedProjectName(titleValue) ) {
      showToastr(`Project name "${titleValue}" is reserved :(`);
      return;
    }
    if( titleValue && titleValue.length > 0 ) {
      const response = await axios.post(`/__project/create`, { name: titleValue, isActive:projActive });
      const { id, name, selected} = response.data;
      
      if( id ) {
        showToastr("project is created successfully :)");
      }

      const titleElement = searchElementByAttribute(targetElement, { id: activeProjectDivId });
      let { htmlObject, eventList } = createAppTitleObject( { id, name, isActive } ); 
      removeAllChildElement( titleElement );
      createHtmlChildElement( titleElement, htmlObject.childElement );
      createEventListener( eventList );
      id && showProjectNameInInput();
    } else {
      showToastr("project title cannot be empty :(");
    }
  }

  async function getProjectList() {
    const response = await fetch("/__project/list");
    const { projectList = [] } = await response.json();
    return await setupProjectData(projectList);
  }

  async function setupProjectData(projectList) {
    let activeProject = {};
    const otherProjects = [];
    for(const proj of projectList) {
      if( proj.selected && Object.keys(activeProject).length === 0 ) {
        activeProject = proj; 
      } else {
        otherProjects.push(proj); 
      } 
    }
    const element = document.getElementById(activeProjectDivId);
    removeAllChildElement( element );

    if( Object.keys( activeProject ).length > 0 ) {
      const { id, name, selected } = activeProject;
      const { htmlObject, eventList } = createAppTitleObject( { id, name, isActive: selected } ); 
      createHtmlChildElement( element, htmlObject.childElement );
      createEventListener( eventList );
      return { id, name, selected, otherProjects }
    } else {
      return { otherProjects };
    }
  }

  async function initFunction() {
    const { id:projectId, otherProjects = [] } = await getProjectList();
    await initializeData(projectId, otherProjects);
  }

  async function initializeData(projectId, otherProjects = []) {
    showInactiveProjectList(otherProjects);
    if(projectId) {
      showProjectNameInInput();
      await getProjectRouteList( projectId );
    }
  }
