import { readFile, writeFile } from 'fs/promises'
import { handleCatch } from './handle.mjs'
import { Compiled } from '../interfaces/Compiled.mjs'

export async function compile(): Promise<Compiled> {
    writeFile('host', '(cd containers/compile; ./run &);')
    let result = await readFile('pipe', { encoding: 'utf8'}).catch(handleCatch)
    return JSON.parse(result)
}