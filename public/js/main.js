const throwErrorForEmptyValue = name => {
  throw `missing parameter value for ${name}`;
};

const removeAllChildElement = (
  htmlElement = throwErrorForEmptyValue("removeAllChildElement")
) => {
  while (htmlElement.hasChildNodes()) {
    htmlElement.removeChild(htmlElement.lastChild);
  }
  return htmlElement;
};

const setHtmlElement = (
  htmlElement = throwErrorForEmptyValue("setHtmlElement"),
  obj
) => {
  for (let key in obj) {
    htmlElement.setAttribute(key, obj[key]);
  }
  return htmlElement;
};

const createTextElement = (
  htmlElement = throwErrorForEmptyValue("createTextElement"),
  text = null
) => {
  const textNode = document.createTextNode(text);
  htmlElement.appendChild(textNode);
  return htmlElement;
};

const createEvent = async (
  name = throwErrorForEmptyValue("createEvent/name"),
  identifier = throwErrorForEmptyValue("createEvent/identifier"),
  type = throwErrorForEmptyValue("createEvent/type"),
  functionReference = throwErrorForEmptyValue("createEvent/functonReference")
) => {
  if (type === "id") {
    document
      .getElementById(identifier)
      .addEventListener(name, functionReference);
  } else if (type === "class") {
    const classname = document.getElementsByClassName(identifier);
    Array.from(classname).forEach(function(element) {
      element.addEventListener(name, functionReference);
    });
  }
};

const createHtmlElement = htmlObject => {
  const {
    name = throwErrorForEmptyValue("createHtmlElement/name"),
    text = null,
    attributes = {},
    childElement = []
  } = htmlObject;
  let element = document.createElement(name);
  text && createTextElement(element, text);
  setHtmlElement(element, attributes);

  childElement &&
    childElement.length !== 0 &&
    createHtmlChildElement(element, childElement);

  return element;
};

// createHtmlChildElement( element, htmlObject.childElement, isRemoveChildElement );
const createHtmlChildElement = (
  element = throwErrorForEmptyValue("createHtmlChildElement"),
  childElement = []
) => {
  for (let child of childElement) {
    const childData = createHtmlElement(child);
    element.appendChild(childData);
  }
  return element;
};

const createEventListener = eventList => {
  for (let event of eventList) {
    let { name = "click", identifier, type = "id", functionReference } = event;
    createEvent(name, identifier, type, functionReference);
  }
};

const getDataAttributes = (
  element = throwErrorForEmptyValue("element"),
  mapData = {}
) => {
  const data = {};
  for (let attribute of element.attributes) {
    if (
      /^(data)\-/.test(attribute.name) &&
      typeof mapData[`${attribute.name}`] !== "undefined"
    ) {
      data[`${mapData[`${attribute.name}`]}`] = attribute.value;
    }
  }
  return data;
};

function verifyAttribute(
  htmlElement = throwErrorForEmptyValue("verifyAttribute"),
  attribute
) {
  let status = false;
  for (let key in attribute) {
    if (htmlElement[`${key}`] === attribute[`${key}`]) {
      status = true;
      break;
    }
  }

  return status;
}

const searchElementByAttribute = (
  htmlElement = throwErrorForEmptyValue(
    "searchParentElementByAttribute/element"
  ),
  attribute = throwErrorForEmptyValue(
    "searchParentElementByAttribute/attribute"
  )
) => {
  if (htmlElement && verifyAttribute(htmlElement, attribute)) {
    return htmlElement;
  }

  let element =
    htmlElement && searchElementByAttribute(htmlElement.parentNode, attribute);

  if (!element && htmlElement && htmlElement.children) {
    for (let child of htmlElement.children) {
      if (verifyAttribute(child, attribute)) {
        element = child;
        break;
      }
    }

    if (!element && htmlElement && htmlElement.parentNode) {
      return searchElementByAttribute(htmlElement.parentNode, attribute);
    } else {
      return element;
    }
  }

  return element;
};
