const { process } = require("./lib/generator");

const schema = {
  category_id: {
    __type: "array",
    __range: "1,3",
    __property: {
      a: {
        __type: "title",
        __range: 2
      },
      b: "float"
    }
  },
  d: "100...120"
};

const data = process(schema);

console.log(JSON.stringify(data, null, 2));
