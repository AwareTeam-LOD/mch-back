async function hello(fastify, options){
    fastify.get('/hello', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {
        fastify.mysql.query(
          'SELECT * FROM users WHERE id = ? AND token = ?', [request.query.user_id, request.query.token],
          function onResult (err, result) {
            result = result[0];
            console.log(result)
            if(!err){
              reply.send({status: "okay", data: {id: result.id, vk_userid: result.vk_userid, volunteer_status: result.volunteer_status, bonuses: result.bonuses}})
            } else{
              reply.send({status: "error", message: "server_error", details: error})
            }
          }
        )

    })
}
  
module.exports = hello