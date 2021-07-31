
  function showInactiveProjectList(projects) {
    const othersProjectElement = document.getElementById(otherProjectDivId);
    const { htmlObjectList, eventObjList } = generateOtherProjectList(projects);

    removeAllChildElement( othersProjectElement );
    createHtmlChildElement( othersProjectElement, htmlObjectList.childElement );
    createEventListener( eventObjList );
  }

  async function getProjectRouteList( projectId ) {
    const response = await axios.get(`/__route/${projectId}/list`);
    const {htmlObjectList, eventObjList} = generateRouteList(response.data || []);
    const routeElement = document.getElementById(routeListDivId);
    removeAllChildElement( routeElement );
    createHtmlChildElement( routeElement, htmlObjectList.childElement );
    createEventListener( eventObjList );
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
    const element = document.getElementsByClassName("toggle-content")[0];
    element.classList.toggle("is-visible");
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
        functionReference: showProjectNameInInput
      }
    )

    for( let { _id, projectId, projectName, routeType, routeName } of routes ) {
      childElementList.push({
        name: "li",
        attributes: {
          class: "route-list",
        },
        childElement: [
          {
            name: "div",
            text: formatRouteText(`${routeType} - ${routeName}`),
            attributes: {
              id: _id,
              class: "route-title",
              [`${projectIdAttr}`]: projectId,
              [`${routeIdAttr}`]: _id
            }
          },
          {
            name: "img",
            attributes: {
              id: `trash#${_id}`,
              src: "/assets/icons/trash.svg",
              class: "nav-icon-black icon-right",
              [`${projectIdAttr}`]: projectId,
              [`${routeIdAttr}`]: _id
            } 
          }
        ]
      });

      eventObjList.push({
        identifier: _id, 
        functionReference: handleShowRouteDetailsClick 
      }, {
        identifier: `trash#${_id}`,
        functionReference: handleRemoveRouteClick
      });
    }

    return { htmlObjectList: { childElement: childElementList }, eventObjList }
  } 

  function formatRouteText( routeName="", len = 25 ) {
    return routeName.length > len
      ? `${routeName.substr(0, len)}....`
      : routeName; 
  } 

  function generateOtherProjectList( projects ) {
    const  childElementList = [];
    const eventObjList = [];
    
    for( let i=0, len=projects.length; i<len; i++ ) {
      let { _id:id, name, isActive } = projects[i];
      const divId =  `other-app-id-${i}`;
      
      childElementList.push({
        name: "li",
        text: name,
        attributes: {
          class: "other-app-title",
          id: divId,
          [`${dataId}`]: id,
          [`${dataActive}`]: isActive,
          [`${dataName}`]: name
        }
      });

      eventObjList.push({
        identifier: divId, 
        functionReference: handleAppSwitchClick 
      });
    }

    childElementList.push({
        name: "li",
        text: name,
        attributes: {
          class: "other-app-title"
        },
        childElement: [
          {
            name: "div",
            attributes: {
              class: "input-group"  
            },
            childElement: [
              {
                name: "input",
                attributes: {
                  type: "text",
                  value: name,
                  class: "input-field",
                  placeholder: "Add new Project",
                  id: otherProjectInputDiv
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
                      id: otherProjectSaveDivId,
                      [`${dataActive}`]: false
                    },
                    childElement: [
                      {
                        name: "img",
                        attributes: {
                          src: "/assets/icons/checkmark.svg",
                          class: "nav-icon-black",
                          [`${dataActive}`]: false
                        }
                      }
                    ]
                  }
                ]
              }
            ] 
          }
        ]
      });

    eventObjList.push({
      identifier: otherProjectSaveDivId, 
      functionReference: handleCreateNewProjectClick 
    });
    
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
    const titleValue = element.value;
    if( titleValue && titleValue.length > 0 ) {
      const response = await axios.post(`/__project/create`, { name: titleValue, isActive });
      const { _id: id} = response.data;
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

  async function handleShowRouteDetailsClick(event) {
    event.preventDefault();

    const selectedRoute = document.querySelector('.route-title-selected');
    selectedRoute && selectedRoute.classList.remove('route-title-selected');
    event.target.classList.toggle("route-title-selected");

    const mapObj = {
      "data-project-id": "projectId",
      "data-route-id": "routeId"
    }
    const { projectId, routeId } = getDataAttributes(event.target, mapObj)
    const result = await axios.get(`/__route/get?id=${routeId}`);
    const routeData = result.data || {};
    updateRouteFormData(routeData);
  }

  async function handleRemoveRouteClick(event) {
    event.preventDefault();
    const mapObj = {
      "data-project-id": "projectId",
      "data-route-id": "routeId"
    }
    const { projectId, routeId } = getDataAttributes(event.target, mapObj)

    routeId && axios.put(`/__route/delete`, { id: routeId})
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
    const { id:activeProjId } = getActiveProjectDetails();

    await axios.put("/__project/switch", { switchAppId, activeProjId });
    await  initFunction() ;
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
              text: name,
              attributes: {
                id: appTitleDivId,
                [`${dataId}`]: id,
                [`${dataActive}`]: isActive,
                [`${dataName}`]: name
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
    const titleValue = element.value;

    if( titleValue && titleValue.length > 0 ) {
      const response = await axios.post(`/__project/create`, { name: titleValue, isActive:projActive });
      const { _id: id, name, isActive} = response.data;
      
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
    const response = await axios.get("/__project/list");
    let activeProject = {};
    const otherProjects = [];
    for(let proj of response.data || []) {
      if( proj.isActive && Object.keys(activeProject).length === 0 ) {
        activeProject = proj; 
      } else {
        otherProjects.push(proj); 
      } 
    }

    const element = document.getElementById(activeProjectDivId);

    if( Object.keys( activeProject ).length !== 0 ) {
      const { _id:id, name, isActive } = activeProject;
      const { htmlObject, eventList } = createAppTitleObject( { id, name, isActive } ); 

      removeAllChildElement( element );
      createHtmlChildElement( element, htmlObject.childElement );
      createEventListener( eventList );
      return { id, name, isActive, otherProjects }
    } else {
      const { htmlObject, eventList } = generateInputField({name: "", isActive: true});
      element.appendChild( createHtmlElement( htmlObject ) );
      createEventListener( eventList );
      return {};
    }
  }

  async function initFunction() {
    const { id:projectId, otherProjects } = await getProjectList();
    projectId && showInactiveProjectList(otherProjects);
    projectId && await getProjectRouteList( projectId );
    projectId && showProjectNameInInput();
  }
