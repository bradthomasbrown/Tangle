import { createServer } from 'http'
import { EventEmitter } from 'events'

// SS - SimpleServer
export class SS extends EventEmitter {

    constructor(params = {}) {
        super()
        Object.assign(this, params)
        this.server = createServer(this.handleRequest.bind(this))
        this.server.listen(80, '0.0.0.0')
    }

    handleRequest(request, response) {
        Object.assign(this, { request, response })
        if (this.verbose) console.log('handling request')
        if (this.func) this.func()
        if (this.data == undefined) this.data = null
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(this.data))
        if (request.url == '/shutdown') this.handleShutdown()
    }

    handleShutdown() {
        if (this.verbose) console.log('handling shutdown')
        this.server.close()
    }

}