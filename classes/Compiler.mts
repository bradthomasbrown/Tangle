import { writeFile } from 'fs/promises'
import { Chain } from './Chain.mjs'

export class Compiler
{

    constructor() {
        writeFile('host', `containers/compiler/run`)
    }
    
}