const { process } = require("./lib/generator");

const schema = {
  value: [["text"]],
  val2: [
    {
      a: "4...10",
      b: "ad,adfa,asda",
      c: "text"
    }
  ],
  val3: ["asd", "43aaf", "dfawef"],
  val4: {
    __type: "array",
    __range: "1,3",
    __property: "a,b,c,d"
  },
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
  d: "100...120",
  domain: "url",
  status: "active,inActive",
  info: {
    aa: {
      bb: {
        cc: {
          dd: {
            ee: {
              ff: {
                gg: {
                  hh: {
                    ii: {
                      jj: {
                        kk: {
                          ll: {
                            __type: "text"
                          },
                          h: ["a", "b"]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const data = process(schema);

console.log(JSON.stringify(data, null, 2));
