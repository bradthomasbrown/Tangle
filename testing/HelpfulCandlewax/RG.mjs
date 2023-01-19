import { get } from 'http'
import { EventEmitter } from 'events'

// RG - RetryingGet
export class RG extends EventEmitter {

    constructor(params = {}) {
        super()
        Object.assign(this, params)
        return new Promise((resolve, reject) => {
            Object.assign(this, { resolve, reject })
            this.attemptGet()
        })
    }

    attemptGet() {
        if (this.verbose) console.log('attempting get')
        let req = get(`http://${this.url}${this.path ?? '/'}`, this.handleResponse.bind(this))
        req.on('error', this.handleError.bind(this))
    }

    handleResponse(response) {
        if (this.verbose) console.log('handling response')
        let data = ''
        response.setEncoding('utf8')
        response.on('data', chunk => data += chunk)
        response.on('end', () => { this.resolve(JSON.parse(data)) })
    }

    handleError(error) {
        if (this.verbose) console.log('handling error')
        if (!this.start) this.start = Date.now()
        if (Date.now() - this.start >= (this.timeout ?? 30000)) this.reject(`rg timeout, last error: ${error}`)
        else setTimeout(this.attemptGet.bind(this), this.int ?? 100)
    }

}