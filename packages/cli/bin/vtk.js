#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const packageJson = require("../package.json");

program.version(packageJson.version).description("VibeThink Dev-Kit CLI");

// Register Commands
require("../src/commands/status")(program);
require("../src/commands/validate")(program);
require("../src/commands/upgrade-bundui")(program);

program.parse(process.argv);
