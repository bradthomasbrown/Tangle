import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        [vue()],
        {
            name: 'configure-response-headers',
            configureServer: server => {
                server.middlewares.use((req, res, next) => {
                    let old = res.end
                    res.end = function() {
                        if (res.headersSent) return old.apply(this, arguments)
                        // if (req.url?.match('.ts')) res.setHeader('Content-Type', 'text/x-typescript')
                        let contentType = String(res.getHeader('Content-Type'))
                        if (contentType && !contentType.match('charset'))
                            res.setHeader('Content-Type', `${contentType}; charset=utf-8`)
                        return old.apply(this, arguments)
                    }
                    next()
                })
            }
        }
    ]
})