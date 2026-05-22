#!/usr/bin/env node

import DocumentXTR from "./DocumentXTR.js";

// TODO: log '🧪 Probando DocumentXTR...'

async function test() {
  try {
    const documentXTR = new DocumentXTR();
    // TODO: log '✅ DocumentXTR instanciado correctamente'

    await documentXTR.execute();
    // TODO: log '✅ DocumentXTR ejecutado correctamente'
  } catch (error) {
    // TODO: log '❌ Error:' error
    process.exit(1);
  }
}

test();
