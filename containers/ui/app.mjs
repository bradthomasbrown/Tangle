import express from 'express'

let app = express()
let port = process.env.PORT || 80
app.set('trust proxy', true);
app.get('*', (req, res) => {
    let { path } = req 
    if (path == '/_ah/start') {
        res.status(404).end()
        return
    }
    if (path == '/') path = '/index.html'
    if (req.header('X-Forwarded-Proto') == 'http') {
        res.redirect(301, `https://${req.headers.host}${path}?v=${parseInt(Date.now() / 10000)}`);
        return
    }
    res.sendFile(path.slice(1), { root: '.' });
});
app.listen(port)