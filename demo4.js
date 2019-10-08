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
      schoolName: "title",
      provider: ["ZIMIA", "PROSPEX"],
      email: "email",
      revenue: "number",
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
      profile: "image"
    }
  },
  message: "Successful",
  version: {
    __fixedValue: "1.0.0"
  }
};

const data = process(schema);

console.log(JSON.stringify(data, null, 2));
