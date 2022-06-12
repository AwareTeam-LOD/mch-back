async function emotional(fastify, options){
    fastify.get('/emotional', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {
            data = JSON.parse(request.query.data)
            var score = 0;
            if(data[0][1] == "Да"){
                score++;
            }
            if(data[1][1] == "Да"){
                score++;
            }
            if(data[2][1] == "Да"){
                score++;
            }
            if(data[3][1] == "Да"){
                score++;
            }
            if(data[4][1] == "Да"){
                score++;
            }
            if(data[5][1] == "Да"){
                score++;
            }
            if(data[6][1] == "Да"){
                score++;
            }
            if(data[7][1] == "Да"){
                score++;
            }
            if(data[8][1] == "Да"){
                score++;
            }
            if(data[9][1] == "Да"){
                score++;
            }

            if(score > 7){
                reply.send({status: "canceled", message: "too_bad"})
            }else{
                fastify.mysql.query(
                    'SELECT * FROM users WHERE id = ? AND token = ?', [request.query.user_id, request.query.token],
                    function onResult (err, result) {
                        var got = JSON.parse(result[0].passed_quizes);
                        var final_passed = got.push('emotional_readness');
                        fastify.mysql.query(
                            'UPDATE users SET passed_quizes = ? WHERE id = ?', [final_passed, request.query.user_id],
                            function onResult (err, result) {
                                reply.send({status: "okay", message: "accepted"})
                            }
                          )
                    }
                  )
            }

    })
}
  
module.exports = emotional