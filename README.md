# ZTL - Zebra transformation language

ZTL is a post-processing language for Zebradb results, the purpose of 
the language is transform Zebradb results into other formats that 
are more suitable for humans and machines.

# Main goals

	* Easy to write,
	* Total: must guarantee termination,
	* Secure: should be restricted to the purpose of transformation
	and nothing else, meaning that should not have access to user 
	system, data or any other resource not necessary to transform.
	* Extendability: being able to add new features without breaking old ones.
		* I need to redesign the language to allow this.		 		

# Future Work

	ZTL is still a work in progress and is being developed along side with 
	Zebradb-core.

	Currently the language is usable to make Zebradb-core results readable 
	by humans, but it has very limiting features.

	In the future I hope to redesign the language to have better support
	for Zebradb-core results format, better error handling and reporting,
	and add more feature.

	The goal is to make ZTL the preferable language to test and share scripts 
	in a secure way among Zebradb-core users.

# Example

```
const ZTL = require("ztl");
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

```

# install

```
	npm install ztl --save
```

