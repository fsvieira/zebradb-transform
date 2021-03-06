"use strict";

const { parse } = require("./zparser");

class ZTL {

    constructor () {
        this.functions = {};
        this.fn = {};
    }

    compile (text) {
        const functions = parse(text);

        for (let i=0; i<functions.length; i++) {
            const fn = functions[i];

            if (this.functions[fn.name]) {
                throw "function " + fn.name + " has alredy been declared.";
            }
            else {
                this.functions[fn.name] = fn;
            }
        }

        for (let i=0; i<functions.length; i++) {
            const fn = functions[i];

            this.validate(this.functions[fn.name]);

            this.fn[fn.name] = query => this.execute(this.functions[fn.name], query);
        }
    }

	executeStmt (code, variables) {
		if (code.type === "variable") {
			const v = variables[code.data];

			if (v.type === 'domain') {
				return v;
			}

			return v.data;
		}
		else if (code.type === "number") {
			return code.data;
		}
		else if (code.type === "string") {
			return code.data;
		}
		else if (code.type === "mathOp") {
			const { op, a, b } = code.data;
			switch (op) {
				case "*":
					return +this.executeStmt(a, variables) *
						+this.executeStmt(b, variables);

				case "/":
					return +this.executeStmt(a, variables) /
						+this.executeStmt(b, variables);

				case "+":
					return +this.executeStmt(a, variables) +
						this.executeStmt(b, variables);

				case "-":
					return +this.executeStmt(a, variables) -
						+this.executeStmt(b, variables);

			}
		}
		else if (code.type === "call") {
			const v = variables[code.data.variable.data];
			const f = this.functions[code.data.funcname];
			return this.execute(f, v);
		}
		else if (code instanceof Array) {
			/* its a concat string ?
			    TODO: make a concatString type
			*/
			let s = "";
			for (let i = 0; i < code.length; i++) {
				const t = this.executeStmt(code[i], variables);

				if (t.type === 'domain') {
					s += "[v$" + t.variable + ": " + t.data.map(p => p.data).join(" ") + "]";
				}
				else {
					s += t;
				}
			}

			return s;
		}
	}

	equals (p, q) {
		if (p.type === q.type) {
			if (p.type === "constant") {
				return p.data === q.data;
			}
			else if (p.type === "variable") {
				// check if variables are the same,
				return p.id === q.id;
			}
			else if (p.type === "tuple" && p.data.length === q.data.length) {
				for (let i = 0; i < p.data.length; i++) {
					if (!this.equals(p.data[i], q.data[i])) {
						return false;
					}
				}

				return true;
			}
		}

		return false;
	}

	match (pattern, q) {

		const variables = {};

		const matches = [{
			p: pattern,
			q
		}];

		while (matches.length) {
			const { p, q } = matches.pop();
			
			if (p.type === "variable") {

				if (p.data !== undefined && p.data !== "") {
					const v = variables[p.data];

					if (v === undefined) {
						variables[p.data] = q;
					}
					else if (!this.equals(v, q)) {
						// if they are not equal than match fails.
						return;
					}
				}
			}
			else if (
				p.type !== q.type ||
				p.type === "constant" && p.data !== q.data ||
				p.type === "tuple" && p.data.length !== q.data.length
			) {
				return;
			}
			else if (p.type === "tuple") {
				for (let i = 0; i < p.data.length; i++) {
					matches.push({
						p: p.data[i],
						q: q.data[i]
					});
				}
			}
		}

		return variables;
	}

	execute (func, query) {
		const statments = func.data.data;

		for (let i = 0; i < statments.length; i++) {
			const stmt = statments[i];

			if (stmt.data.match) {
				const variables = this.match(stmt.data.match, query);

				if (variables) {
					return this.executeStmt(stmt.data.code, variables);
				}
			}
			else {
				/*
				    TODO:
				     - normalize data structure for
				       statment and defaultStatement.
				*/
				return this.executeStmt(stmt.data[0], {});
			}
		}

		return query;
	}

	getVariablesAndCalls (code) {

		const variables = {};
		const calls = {};
		let anonymous = false;

		if (code) {
			const codes = [code];
			while (codes.length) {
				const v = codes.pop();

				if (v.type === "variable") {
					if (v.data === undefined || v.data === "") {
						anonymous = true;
					}
					else {
						variables[v.data] = true;
					}
				}
				else if (v.type === "call") {
					calls[v.data.funcname] = true;
					codes.push(v.data.variable);
				}
				else if (v instanceof Array) {
					for (let i = 0; i < v.length; i++) {
						codes.push(v[i]);
					}
				}
				else if (typeof v === "object") {
					for (let i in v) {
						if (v.hasOwnProperty(i)) {
							const d = v[i];
							if (d instanceof Array || typeof d === "object") {
								codes.push(v[i]);
							}
						}
					}
				}
			}
		}

		return { variables, calls, anonymous };
	}

	validate (func) {
		const statments = func.data.data;

		for (let i = 0; i < statments.length; i++) {
			const stmt = statments[i];

			const { variables, calls, anonymous } =
			this.getVariablesAndCalls(stmt.data.code);

			// 1. check for anonymous variables
			if (anonymous) {
				return {
					funcname: func.name,
					reason: "Anonymous variables are not allowed " +
						"on the function body."
				};
			}

			// 2. check if all functions calls exist.
			for (let name in calls) {
				if (this.functions[name] === undefined) {
					return {
						funcname: func.name,
						reason: "Function " + name + " is not defined."
					};
				}
			}

			// 3. check that all body variables also exists on the head,
			const { variables: head } = this.getVariablesAndCalls(
				stmt.data.match
			);

			// check if all variables on code are on the head,
			for (let v in variables) {
				if (variables.hasOwnProperty(v)) {
					if (!head[v]) {
						return {
							funcname: func.name,
							reason: "Variable " + v +
								" found on body but not on head."
						};
					}
				}
			}
		}

        return true;
    }
}

module.exports = ZTL;

