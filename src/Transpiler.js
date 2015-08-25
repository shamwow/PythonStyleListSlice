import escodegen from '../lib/escodegen';
// Need to do old style require for acorn because its build process is a bit different.
const acorn = require('../lib/acorn');

export default {
    rangeFnName: '__$$__computedMemberRangeGet__$$__',
    setRangeFunctionName: function (name) {
        const fn = this[this.rangeFnName];
        delete this[this.rangeFnName];
        this.rangeFnName = name;
        this[this.rangeFnName] = fn;
    },
    '__$$__computedMemberRangeGet__$$__': function (arr, start, end, skip=1) {
        if (!Array.isArray(arr) && typeof arr !== 'string') {
            throw new Error('Computed member range gets only supported on arrays and strings.');
        }

        if (skip === 0) {
            throw new Error('Computed member range skip step can\'t be zero');
        }

        const isInt = num =>
                num === undefined || (typeof num === 'number' && num % 1 === 0);

        if (!isInt(start) || !isInt(end) || !isInt(skip)) {
            throw new Error('Start, end, and skip must be integers.');
        }

        let result = arr.slice(start, end);

        if (skip < 0) {
            result = result.reverse();
            skip *= -1;
        }

        return result.filter((item, idx) => idx % skip === 0);
    },

    getFnName: '__$$__computedMemberGet__$$__',
    setGetFunctionName: function (name) {
        const fn = this[this.getFnName];
        delete this[this.getFnName];
        this.getFnName = name;
        this[this.getFnName] = fn;
    },
    '__$$__computedMemberGet__$$__': function (arr, idx) {
        const isInt = num =>
                typeof num === 'number' && num % 1 === 0;

        const stringOrArray = item => Array.isArray(item) || typeof item === 'string';

        if (!stringOrArray(arr) || idx in arr || !isInt(idx) || idx >= 0) {
            return arr[idx];
        }
        // Otherwise, must be a negative integer.
        else {
            return arr[arr.length + idx];
        }
    },

    setFnName: '__$$__computedMemberSet__$$__',
    setSetFunctionName: function (name) {
        const fn = this[this.setFnName];
        delete this[this.setFnName];
        this.setFnName = name;
        this[this.setFnName] = fn;
    },
    '__$$__computedMemberSet__$$__': function (arr, idx, val) {
        const isInt = num =>
                typeof num === 'number' && num % 1 === 0;

        const stringOrArray = item => Array.isArray(item) || typeof item === 'string';

        if (!stringOrArray(arr) || idx in arr || !isInt(idx) || idx >= 0) {
            return arr[idx] = val;
        }
        // Otherwise, idx must be a negative integer that is not set as a property.
        else {
            return arr[arr.length + idx] = val;
        }
    },

    functionCode: function () {
        return `${this[this.getFnName].toString()}\n`
                + `${this[this.setFnName].toString()}\n`
                + `${this[this.rangeFnName].toString()}\n\n`;
    },

    setNames: function () {
        process.env['__$$__computedMemberSet__$$__'] = this.setFnName;
        process.env['__$$__computedMemberGet__$$__'] = this.getFnName;
        process.env['__$$__computedMemberRangeGet__$$__'] = this.rangeFnName;
    },

    transpile: function (content, fileName='dummy.js', sourceMap=false) {
        this.setNames();

        const opts = (sourceMap) ? {
            sourceMap: fileName,
            sourceMapWithCode: true,
            comment: true,
            sourceContent: content
        } : undefined;

        const result = escodegen.generate(acorn.parse(content, {
            ecmaVersion: 8,
            allowHashBang: true,
            preserveParens: true,
            locations: sourceMap,
            sourceFile: fileName
        }), opts);

        let output = this.functionCode() + result.code;

        if (sourceMap) {
            output += '\n//# sourceMappingURL=data:application/json;base64,' +
                    new Buffer(result.map.toString()).toString('base64');
        }

        return output;
    }
};
