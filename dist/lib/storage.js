"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowed_block_text = exports.allowed_end_of_line = exports.alphanumericCharList = exports.capitalCharList = exports.smallCharList = exports.docFileList = exports.csvFileList = exports.pdfFileList = exports.imageList = exports.emailDomainList = exports.domainList = exports.randomArrayData = exports.getMinMax = exports.randomNumberGenerator = void 0;
const randomNumberGenerator = (max = 0, min = 0) => {
    return max
        ? Math.round(Math.random() * (+max - +min)) + min
        : Math.round(Math.random());
};
exports.randomNumberGenerator = randomNumberGenerator;
const getMinMax = (__range = "") => {
    if (!__range || __range === "" || isNaN(Number(__range))) {
        let [max, min = 1] = __range.split(",");
        return {
            max: max && max !== "" ? parseInt(max, 10) : 10,
            min: parseInt(`${min}`, 10)
        };
    }
    else {
        let max = parseInt(__range, 10);
        return { min: 0, max };
    }
};
exports.getMinMax = getMinMax;
const randomArrayData = (arrayData = []) => {
    return arrayData[Math.floor(Math.random() * arrayData.length)];
};
exports.randomArrayData = randomArrayData;
exports.domainList = [
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
exports.emailDomainList = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "yopmail.com",
    "zoho.com"
];
const numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
exports.imageList = [
    "images/image1.png",
    "images/image2.png",
    "images/image3.png",
    "images/image4.png",
    "images/image5.png",
    "images/image6.png",
    "images/image7.png",
    "images/image8.png"
];
exports.pdfFileList = ["files/pdf-file1.pdf"];
exports.csvFileList = ["files/csv-file1.csv"];
exports.docFileList = ["files/doc-file1.docx"];
exports.smallCharList = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z"
];
exports.capitalCharList = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z"
];
exports.alphanumericCharList = [...exports.smallCharList, ...exports.capitalCharList, ...numberList];
exports.allowed_end_of_line = [
    '.', ',', '-',
    '!', '?', ':', '\r\n', '\r', '\n'
];
const allowed_block_text = (text) => {
    const data = [
        `'${text}'`,
        `"${text}"`,
        `(${text})`
    ];
    return (0, exports.randomArrayData)(data);
};
exports.allowed_block_text = allowed_block_text;
