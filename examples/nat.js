// node examples/nat.js
const ZTL = require("../");
const ztl = new ZTL();

ztl.compile(`
    decimal:
        (nat 0) -> 0,
        (nat 'n) -> 1 + 'n | decimal.
`);


const number = ztl.fn.decimal(
    // (nat (nat (nat 0))) => 2.
    {
        type: 'tuple',
        data: [
            {type: 'constant', data: 'nat'},
            {
                type: 'tuple',
                data: [
                    {type: 'constant', data: 'nat'},
                    {
                        type: 'tuple',
                        data: [
                            {type: 'constant', data: 'nat'},
                            {type: 'constant', data: '0'}
                        ]
                    }
                ]
            }
        ] 
    }
);

console.log(number); // output: 2

