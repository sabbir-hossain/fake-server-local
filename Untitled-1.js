
export class ProjectController {

    public constructor() {
        this.db = new DatabaseService();
    }

    @All('/**)
    public getData(@Req() request: express.Request, @Res() response: express.Response): MockDataObject {
        // console.log('request --->', request);
        console.log({
            project: request.params.project,
            method: request.method,
            params: `/${request.params[0]}`,
            param: request.params
        });
        const {routeData, secret} = this.db.getSchemaData (request.params.project, request.method, `/$
        {request.params[0]}`);

        if (!routeData) {
            return response.status(StatusCodes.NOT_FOUND).send({
                message: `Route ${request.params[0]} not found in project ${request.params.project}.`,
            });
        }

        const { schema } = routeData || {};

        const schemaData: MockDataDataResponse = {
            _output: schema,
        };

        const data: MockDataDataResponse = process (schemaData, {}, { secret }) as MockDataDataResponse;

        return response.status(StatusCodes.OK).send(data._output);
    }
}



+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


export class ProjectController {

    public constructor() {
        this.db = new DatabaseService();
    }

    @All('/**')
    public getData(@Req() request: express.Request, @Res() response: express. Response): MockDataObject {
        // console.log('request --->', request);
        console.log({
            project: request.params.project,
            method: request.method,
            params: `/${request.params[0]}`,
            param: request.params
        });
        const {routeData, secret} = this.db.getSchemaData (request.params.project, request.method, `/$
        {request.params[0]}`);

        if (!routeData) {
            return response.status(StatusCodes.NOT_FOUND).send({
                message: `Route ${request.params[0]} not found in project ${request.params.project}.`,
            });
        }
        const { schema } = routeData || {};

        const schemaData: MockDataDataResponse = {
            _output: schema,
        };

        const data: MockDataDataResponse = process (schemaData, {}, { secret }) as MockDataDataResponse;

        return response.status (StatusCodes.OK).send(data._output );
    }
}



++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

 
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


@All('/*')
public getData(@Req() request: express.Request, @Res() response: express.Response): MockDataObject {
    // console.log('request --->', request);
    console.log({
        project: request.params.project,
        method: request.method,
        params: `/${request.params[0]}`,
        param: request.params
    });
    const {routeData, secret} = this.db.getSchemaData(request.params.project, request.method, `/$
    {request.params[0]}^`);
    if (!routeD ± (parameter) response: express. Response<any, Record<string, any>>
        return response.status(StatusCodes.NOT_FOUND).send({
            message: `Route ${request.params[0]} not found in project ${request.params.project}.`,
        });
    }
    const { schema } = routeData || {};
    const schemaData: MockDataDataResponse = {
        _ output: schema,
    };
    const data: MockDataDataResponse = process(schemaData, {}, { secret }) as MockDataDataResponse;
    return response.status(StatusCodes.OK).send(data._output);
}

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


9 const processData = (type, params = {}, option: Options): string | number[] => {
10 const typeDataList = type.split('>');
11
12 if(typeDataList && typeDataList.length === 1) {
13 return generateData (typeDataList[0], params, option);
14 }
15
16 let result = '';
17
18 for(const dataType of typeDataList) {
19 result += `${generateData(dataType, params, option)}'`;
20 }
21
22 return result;
23 };
24
25 const generateData = (type, params = {}, option: Options): string | number[] => {
26 const typeDataList = type.split(':'); 
27 if(!typeDataList [0] || typeDataList[0].length === 0) {
28 return dataGenerator.default();
29 }
I
30
31 return typeof dataGenerator[typeDataList[0]] !== 'undefined'
32 ? dataGenerator [typeDataList[0]] (typeDataList [1] || '', params, option)
33 : processUserData(type);
34 };
35

const processUserData = (input: string): string | number[] => {
const userOutput = input.split('|');
if (userOutput.length > 1) {
return processUserData (getRandomArrayValue(userOutput) as string);
} else {
const rangeOutput = input.split('...');
if (checkNumber(rangeOutput[1], rangeOutput[0])) {
return generateRangeData(
parseInt(rangeOutput [0], 10),
parseInt(rangeOutput [1], 10)
);
} else {
return rangeOutput[0];
}
}
};

const generateRangeData = (start: number, end: number): number[] => {
const rangeData = [];
for (let i = start; i <= end; i++) {
rangeData.push(i);
}
return rangeData [Math.floor(Math.random() * rangeData.length)];
};

const processArrayData = (arraySchema: Params[] = [], schema: ObjectSchemaoptions = {}, option:
MockDataObject => {
let data =
[];
if (arraySchema.length === 1) {

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


export const allowed_end_of_line = [
107
108
!, ?, :,
109
\r\n \r \n
110
];
111
112
export const allowed_block_text = (text: string): string => {
113
const data = [
114
"${text}",
115
'${text}'`,
116
`(${text})`,
117
`[${text}],
You, 6 days ago • feat: Enhance data generation utilities by addi...
118
`{${text}}',
119
];
120
121
return getRandomArrayValue(data) as string;
122
};

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const booleanGenerator = (): boolean => {
return ! Math.round(Math.random());
};

const integerGenerator = (digit = '3'): number => {
const totalDigit = parseInt(digit || '3', 10);
return randomNumberGenerator(
Math.pow(10, totalDigit - 1),
Math.pow(10, totalDigit) - 1
)
};

const floatGenerator = (digit = '3.2'): number => {
const [totalDigit='3', toFix='2'] = digit.split('.');
return Number(`${integerGenerator (totalDigit)}.${integerGenerator (toFix)}`);
};

