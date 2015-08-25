# PythonStyleListSlice
Python like list slicing in javascript. Transpiles JavaScript to allow for `arr[1:2]`, `arr[::2]`, `arr[-1]`, `arr[-1] = 5`, etc...

# Installation
`npm -g install python-style-slicing`

# Usage
`pss [file] [--s] [-o output_location]`

If no file given, `pss` will read from `stdin`. If no output location given, `pss` will output to `stdout`. The `--s` flag option indicates whether or not to generate source maps along with output.

# How It Works
Uses a modified version of the [acorn](https://github.com/marijnh/acorn) parser to generate an AST with the following new nodes:
```
ComputedMemberRangeExpression: {
    startExpression: Expression,
    endExpression: Expression,
    skipExpression: Expression
},
ComputedMemberAssignmentExpression: <The same as an AssignmentExpression>
```

A modified version of the (escodegen)[https://github.com/estools/escodegen] code generator then generates code.
```
ComputedMemberRangeExpression ->
    __$$__computedMemberRangeGet__$$__(array, startExpression, endExpression, skipExpression)
ComputedMemberAssignmentExpression ->
    __$$__computedMemberSet__$$__(array, property, value, operator)
ComputedMember ->
    __$$__ComputedMemberGet__$$__(array, property)
```
