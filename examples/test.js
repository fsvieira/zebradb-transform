// node examples/test.js
const ZTL = require("../");

const ztl = new ZTL();


ztl.compile(`
    nextTypes:
        ('x : 'y 'r) -> " -> " 'y "" 'r | nextTypes,
        ' -> "". 

    firstType:
        ('x : 'y 'r) -> "" 'y "" 'r | nextTypes,
        ' -> "".
`);


const r = ztl.fn.firstType(
    {
        "type": "tuple",
        "data": [
            {
                "type": "constant",
                "data": "x"
            },
            {
                "type": "constant",
                "data": ":"
            },
            {
                "type": "constant",
                "data": "real"
            },
            {
                "type": "tuple",
                "data": [
                    {
                        "type": "constant",
                        "data": "y"
                    },
                    {
                        "type": "constant",
                        "data": ":"
                    },
                    {
                        "type": "domain",
                        "data": [
                            {
                                "type": "constant",
                                "data": "int"
                            },
                            {
                                "type": "constant",
                                "data": "real"
                            }
                        ],
                        "variable": 149
                    },
                    {
                        "type": "tuple",
                        "data": [
                            {
                                "type": "constant",
                                "data": "*"
                            },
                            {
                                "type": "constant",
                                "data": ":"
                            },
                            {
                                "type": "constant",
                                "data": "real"
                            },
                            {
                                "type": "constant",
                                "data": "->"
                            },
                            {
                                "type": "domain",
                                "data": [
                                    {
                                        "type": "constant",
                                        "data": "int"
                                    },
                                    {
                                        "type": "constant",
                                        "data": "real"
                                    }
                                ],
                                "variable": 149
                            },
                            {
                                "type": "constant",
                                "data": "->"
                            },
                            {
                                "type": "constant",
                                "data": "real"
                            },
                            {
                                "type": "variable",
                                "id": "id$25"
                            }
                        ],
                        "check": true
                    }
                ],
                "check": true
            }
        ],
        "negation": [],
        "check": true
    }    
);

console.log(r);

