const { process } = require("./lib/generator");

const schema = {
  status: {
    __fixedValue: "success"
  },
  data: [
    {
      id: "uuid",
      schoolId: "uuid",
      schoolName: "title",
      provider: ["ZIMIA", "PROSPEX"],
      email: "email",
      revenue: "number",
      widgetId: "uuid"
    }
  ],
  message: {
    __fixedValue: "Successful"
  },
  version: {
    __fixedValue: "1.0.0"
  }
};

const data = process(schema);

console.log(JSON.stringify(data, null, 2));
