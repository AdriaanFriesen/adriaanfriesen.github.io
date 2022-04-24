"use strict";

class WrongTermTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = "WrongTermTypeError";
    }
}

class Equation {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    get leftExpression() {
        return this.left;
    }

    get rightExpression() {
        return this.right;
    }

    solve(variable) {

    }
}

class Expression {

    // simple: whether the expression contains multiple terms or is a single term
    // contents: either an array of the shallow factors of the term if simple, or an array of the terms that are summed (important: subtraction is not allowed) if not simple

    constructor(simple, contents) {
        this.simple = simple;
        if (simple) {
            this.factors = contents;
        }
        else {
            this.terms = contents;
        }
    }

    get isSimple() {
        return this.simple;
    }
    
    get factorList() {
        if (this.simple) {
            return this.factors;
        }
        else {
            throw WrongTermTypeError("Term is simple, not complex");
        }
    }

    get termList() {
        if (!this.simple) {
            return this.terms;
        }
        else {
            throw WrongTermTypeError("Term is complex, not simple");
        }
    }

}

class Factor {
    constructor(coefficient, value, exponent) {
        this.coefficient = coefficient;
        this.value = value;
        if (exponent == undefined) {
            this.exponent = 1;
        }
        else {
            this.exponent = exponent;
        }
    }
}

class Variable {
    constructor(name) {
        this.name = name;
    }
}

class Fraction {
    constructor(numerator, denominator) {
        this.numerator = numerator;
        this.denominator = denominator;
    }
}

class Term extends Expression {

    // simple: whether the term contains multiple terms or is a single term
    // contents: either the shallow factors of the term if simple, or the terms that are summed (important: subtraction is not allowed) if not simple
    // parent: the term or expression this term is an addend of

    constructor(simple, contents) {
        super(simple, contents);
        // this.parent = parent;
    }
}