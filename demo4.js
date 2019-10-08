const { process } = require("./lib/generator");

const schema = {
  status: {
    __fixedValue: "success"
  },
  data: {
    __type: "array",
    __limit: 2,
    __property: {
      id: "id",
      schoolId: "uuid",
      schoolName: {
        __type: "title",
        __limit: 2
      },
      provider: ["ZIMIA", "PROSPEX"],
      email: "email",
      revenue: {
        __tofix: 3,
        __type: "float",
        __max: 100000,
        __min: 1111
      },
      d: "integer",
      widgetId: "uuid"
    }
  },
  another: {
    __type: "array",
    __max: 6,
    __min: 2,
    __property: {
      id: "uuid",
      val: ["4...10"],
      ipAddress: "ipaddress",
      profile: "image",
      document: "pdf"
    }
  },
  message: "Successful",
  version: {
    __fixedValue: "1.0.0"
  }
};

const data = process(schema);

console.log(JSON.stringify(data, null, 2));
