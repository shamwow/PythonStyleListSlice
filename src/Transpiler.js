import acorn from '../lib/acorn';
import escodegen from '../lib/escodegen';

export default {
    rangeFnName: '__$$__computedMemberRangeGet__$$__',
    rangeFn: function (arr, start, end, skip=1) {
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
    getFn: function (arr, idx) {
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
    setFn: function (arr, idx, val) {
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
        return `var ${this.getFnName} = ${this.getFn.toString()}\n`
                + `var ${this.setFnName} = ${this.setFn.toString()}\n`
                + `var ${this.rangeFnName} = ${this.rangeFn.toString()}\n\n`;
    },

    setNames: function () {
        process.env['__$$__computedMemberSet__$$__'] = this.setFnName;
        process.env['__$$__computedMemberGet__$$__'] = this.getFnName;
        process.env['__$$__computedMemberRangeGet__$$__'] = this.rangeFnName;
    },

    transpile: function (content, sourceMap=true) {
        return this.functionCode() +
                escodegen.generate(acorn.parse(content, {
                    ecmaVersion: 8,
                    allowHashBang: true,
                    preserveParens: true
                }), {
                    sourceMap: sourceMap,
                    sourceMapWithCode: sourceMap,
                    comment: true
                });
    }
};
