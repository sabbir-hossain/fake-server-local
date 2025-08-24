
export const randomNumberGenerator = (max = 0, min = 0): number => {
  return max
    ? Math.round(Math.random() * (+max - +min)) + min
    : Math.round(Math.random());
};

export const getMinMax = (__range: string = "") => {
  if (!__range || __range === "" || isNaN(Number(__range))) {
    let [max, min = 1] = __range.split(",");
    return {
      max: max && max !== "" ? parseInt(max, 10) : 10,
      min: parseInt(`${min}`, 10)
    };
  } else {
    let max = parseInt(__range, 10);
    return { min: 0, max };
  }
};

export const randomArrayData = (arrayData: any[] = []): any => {
  return arrayData[Math.floor(Math.random() * arrayData.length)];
};

export const domainList = [
  "com",
  "net",
  "org",
  "info",
  "me",
  "dev",
  "int",
  "edu",
  "gov",
  "io",
  "cc",
  "co",
  "app"
];

export const emailDomainList = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "yopmail.com",
  "zoho.com"
];


const numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

export const imageList = [
  "images/image1.png",
  "images/image2.png",
  "images/image3.png",
  "images/image4.png",
  "images/image5.png",
  "images/image6.png",
  "images/image7.png",
  "images/image8.png"
];

export const pdfFileList = ["files/pdf-file1.pdf"];
export const csvFileList = ["files/csv-file1.csv"];
export const docFileList = ["files/doc-file1.docx"];

export const smallCharList = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
  "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
  "u", "v", "w", "x", "y", "z"
];

export const capitalCharList = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z"
];

export const alphanumericCharList = [...smallCharList, ...capitalCharList, ...numberList];


export const allowed_end_of_line = [
  '.', ',', '-',
  '!', '?', ':', '\r\n', '\r', '\n'
];

export const allowed_block_text = (text: string): string => {
  const data = [
  `'${text}'`,
  `"${text}"`,
  `(${text})`
  ];
  return randomArrayData(data) as string;
};
