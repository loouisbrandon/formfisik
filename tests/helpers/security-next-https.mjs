// Test-only HTTPS wrapper around the actual production Next build and route tree.
import next from 'next'
import https from 'node:https'
import fs from 'node:fs'
const app=next({dev:false,hostname:'localhost',port:3443})
app.prepare().then(()=>{
 const server=https.createServer({key:fs.readFileSync(process.env.FF015_TEST_TLS_KEY),cert:fs.readFileSync(process.env.FF015_TEST_TLS_CERT)},app.getRequestHandler())
 server.listen(3443,'127.0.0.1',()=>console.info('production_https_test_ready'))
 process.on('SIGTERM',()=>{server.closeAllConnections();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),1000).unref()})
}).catch(()=>{console.error('production_https_test_failed');process.exit(1)})
