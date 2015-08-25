#!/usr/bin/env node

require('source-map-support').install();
require('babel/polyfill');

import ArgvParser from 'argvparser';
import fs from 'fs';
import path from 'path';
import sh from 'shelljs';
import Transpiler from './Transpiler';

const program = new ArgvParser();

program.register('-o [file] --s', (file, options, flags) => {
    const cwd = sh.pwd();
    const out = (options.o) ? fs.createWriteStream(path.join(cwd, options.o)) : process.stdout ;

    Transpiler.setNames();

    if (file) {
        const content = fs.readFileSync(path.join(cwd, file)).toString();
        let relativePath = file;
        if (options.o) {
            relativePath = path.relative(path.dirname(path.resolve(file)),
                    path.resolve(options.o))
        }
        out.write(Transpiler.transpile(content, relativePath, flags.s));
        if (options.o) {
            out.end();
        }
    }
    else {
        let input = '';
        process.stdin.on('data', function(chunk) {
            input += chunk;
        });

        process.stdin.on('end', function() {
            out.write(Transpiler.transpile(input, 'dummy.js', flags.s));
            if (options.o) {
                out.end();
            }
        });
    }
});

program.parse();
