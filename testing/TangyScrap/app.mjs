#!/usr/bin/env node 

import { RG, SS } from 'helpfulcandlewax/index.mjs'

new SS({ data: 'data' })
console.log(await new RG({ url: '127.0.0.1', path: '/shutdown' }))