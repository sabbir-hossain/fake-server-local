const wordList = [
  "mel",
  "amet",
  "nostrud",
  "fastidii",
  "noluisse",
  "laboramus",
  "duo",
  "nec",
  "facete",
  "appareat",
  "repudiandae",
  "ceteros",
  "delicata",
  "mnesarchum",
  "pro",
  "dicat",
  "ubique",
  "alii",
  "tritani",
  "nam",
  "pri",
  "nobis",
  "signiferumque",
  "affert",
  "numquam",
  "delectus",
  "ponderum",
  "vim",
  "repudiare",
  "honestatis",
  "quo",
  "dolore",
  "suavitate",
  "assentior",
  "dolores",
  "intellegat",
  "per",
  "etiam",
  "dolor",
  "mei",
  "congue",
  "audire",
  "exerci",
  "scaevola",
  "his",
  "nemore",
  "praesent",
  "scribentur",
  "tollit",
  "platonem",
  "eloquentiam",
  "cum",
  "graecis",
  "rationibus",
  "vituperatoribus",
  "eos",
  "solum",
  "saepe",
  "consequat",
  "vix",
  "sed",
  "iuvaret",
  "mandamus",
  "agam",
  "commodo",
  "debet",
  "indoctum",
  "abhorreant",
  "dolorum",
  "adipisci",
  "definitionem",
  "nibh",
  "diceret",
  "omittam",
  "qui",
  "quidam",
  "persius",
  "quaeque",
  "eam",
  "sumo",
  "aliquid",
  "similique",
  "ius",
  "malorum",
  "principes",
  "reque",
  "cotidieque",
  "concludaturque",
  "placerat",
  "scriptorem",
  "has",
  "vide",
  "nusquam",
  "democritum",
  "voluptatibus",
  "ludus",
  "efficiendi",
  "quaerendum",
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "elit",
  "magnis",
  "aliquam",
  "nunc",
  "semper",
  "elementum",
  "malesuada",
  "ligula",
  "ultricies",
  "vitae",
  "hendrerit",
  "dignissim",
  "suspendisse",
  "dapibus",
  "viverra",
  "integer",
  "inceptos",
  "risus",
  "non",
  "mollis",
  "faucibus",
  "donec",
  "adipiscing",
  "nulla",
  "magna",
  "nullam",
  "turpis",
  "taciti",
  "arcu",
  "varius",
  "hymenaeos",
  "volutpat",
  "blandit",
  "metus",
  "temporibus",
  "tempus",
  "proin",
  "feugiat",
  "cursus",
  "commodo",
  "quis",
  "gravida",
  "ante",
  "suscipit",
  "enim",
  "cras",
  "mauris",
  "velit",
  "vivamus",
  "aliquet",
  "felis",
  "euismod",
  "vestibulum",
  "habitant",
  "accumsan",
  "urna",
  "fringilla"
];

const domainList = [
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

const emailDomainList = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "yopmail.com",
  "zoho.com"
];

const phoneAreaList = [
  205,
  251,
  256,
  907,
  479,
  501,
  870,
  479,
  209,
  310,
  323,
  747,
  760,
  805,
  203,
  302,
  239,
  305,
  321,
  352,
  229,
  404,
  470,
  478,
  212,
  315,
  704,
  743
];

const numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const imageList = [
  "images/image1.png",
  "images/image2.png",
  "images/image3.png",
  "images/image4.png",
  "images/image5.png",
  "images/image6.png",
  "images/image7.png",
  "images/image8.png"
];

const pdfFileList = ["files/pdf-file1.pdf"];
const csvFileList = ["files/csv-file1.csv"];
const docFileList = ["files/doc-file1.docx"];

const smallCharList = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
  "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
  "u", "v", "w", "x", "y", "z"
];

const capitalCharList = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
  "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
  "U", "V", "W", "X", "Y", "Z"
];

const alphanumericCharList = [...smallCharList, ...capitalCharList, ...numberList];

module.exports = {
  wordList,
  imageList,
  numberList,
  domainList,
  phoneAreaList,
  emailDomainList,
  pdfFileList,
  csvFileList,
  docFileList,
  smallCharList,
  capitalCharList, 
  alphanumericCharList
};
