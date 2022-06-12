async function enroll(fastify, options){
    fastify.get('/enroll', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {
        fastify.mysql.query(
            `SELECT volunteer_status FROM users WHERE id = ?`, [request.query.user_id],
            function onResult(err, result) {
                data = JSON.parse(result[0].volunteer_status);
                data.status = "enrolled";
                fastify.mysql.query(
                    `UPDATE users SET volunteer_status = ?, dobroru_id = ? WHERE id = ?`, [JSON.stringify(data), request.query.dobroru_id, request.query.user_id],
                    function onResult(err_update, result_update) {
                        reply.send({
                            status: "enrolled",
                            result: result_update,
                            error: err_update
                        })
                    }
                )
            }
        )

    })
}


  
module.exports = enroll