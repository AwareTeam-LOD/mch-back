require('dotenv').config()

const fastify = require('fastify')({
  logger: process.env.loggerToggler
})

const autoload = require('fastify-autoload')
const path = require('path')

fastify.register(require('fastify-cors'), { 
  // put your options here
  origin: '*'
})

fastify.register(require('fastify-mysql'), {
  connectionString: `mysql://${process.env.database_username}:${process.env.database_password}@${process.env.database_host}/${process.env.database_basename}`
})

fastify.register(require('fastify-auth'))

fastify.register(autoload, {
  dir: path.join(__dirname, 'routes')
}).decorate('userAuth', function (request, reply, done) {
    //if (verificationResult == true) {
    //  done()
    //} else {
    //    console.log("W2")
    //    done(new Error('auth_error'))
    //    request.code(401)
    //}

  
    var preprocess__user_id;
    var preprocess__token;
    if(request.params[0] != undefined){
      preprocess__user_id = request.params.user_id;
      preprocess__token = request.params.token;    
    }else{
      preprocess__user_id = request.query.user_id;
      preprocess__token = request.query.token;
    }

    fastify.mysql.query(
      'SELECT * FROM users WHERE id = ? AND token = ?', [preprocess__user_id, preprocess__token],
      function onResult (err, result) {
        if(!err){
          if(result[0] != undefined){
            done()
          } else {
            done(new Error('auth_error'))
          }
        } else{
          done(new Error('auth_error'))
        }
      }
    )

  }).after(() => {
    fastify.route({
      method: 'POST',
      url: '/auth-multiple',
      preHandler: fastify.auth([
        fastify.userAuth
      ]),
      handler: (req, reply) => {
        req.log.info('Auth route')
        reply.send({ hello: 'world' })
      }
    })
  })


fastify.listen(process.env.server_port, process.env.server_ip, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})