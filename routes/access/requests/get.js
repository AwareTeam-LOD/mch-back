async function get(fastify, options){
    fastify.get('/get', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {
        fastify.mysql.query(
            `SELECT owner, status, assigned_volunteer, title, notes, grade, subject, files FROM requests WHERE id = ? AND owner = ?`, [request.query.request_id, request.query.user_id],
            function onResult(err, result) {
                reply.send({
                    status: "okay",
                    result: result
                })
            }
        )

    })
}


  
module.exports = get