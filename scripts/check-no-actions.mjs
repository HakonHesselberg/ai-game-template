#!/usr/bin/env node
import { existsSync } from 'node:fs';

if (existsSync('.github/workflows')) {
  console.error('GitHub Actions workflows are prohibited.');
  process.exitCode = 1;
} else {
  console.log('No GitHub Actions workflows found.');
}
