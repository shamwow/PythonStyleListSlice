#!/usr/bin/env node

import ArgvParser from 'argvparser';
import fs from 'fs';
import path from 'path';
import sh from 'shelljs';
import Transpiler from './Transpiler';

const program = new ArgvParser();

program.register('-o', (files, options) => {
    const cwd = sh.pwd();
    const out = (options.o) ? fs.createWriteStream(path.join(cwd, options.o)) : process.stdout ;

    let input = '';
    process.stdin.on('data', function(chunk) {
        input += chunk;
    });

    process.stdin.on('end', function() {
        out.write(Transpiler.transpile(input));
        if (options.o) {
            out.end();
        }
    });
});

program.parse();
