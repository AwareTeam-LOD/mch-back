async function create(fastify, options){
    fastify.post('/create', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {

        data = JSON.parse(request.body);

        notes = "null";
        if(data.notes != null){
            notes = data.notes;
        }

        data_responsibilities = "null";
        if(data.data_responsibilities){
            data_responsibilities = data_responsibilities.notes;
        }

        data_requiredskills = "null";
        if(data.data_requiredskills){
            data_requiredskills = data.data_requiredskills;
        }

        data_servicesforvolunteers = "null";
        if(data.data_servicesforvolunteers){
            data_servicesforvolunteers = data.data_servicesforvolunteers;
        }

        data_targetaudience = "null";
        if(data.data_targetaudience){
            data_targetaudience = data.data_targetaudience;
        }

        fastify.mysql.query(
            `INSERT INTO requests (owner, category, organizator_title, direction, title, notes, data_responsibilities, data_requiredskills, data_servicesforvolunteers, data_targetaudience, start_date, end_date, age_restriction, files)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [request.query.user_id, null, data.oragization_title, data.direction, data.title, notes, data_responsibilities, data_requiredskills, data_servicesforvolunteers, data_targetaudience, data.date, null, data.age_restriction, null],
            function onResult(err, result) {
                if(!err){
                    if(result.insertId > 0){
                        reply.send({
                            status: "okay",
                            requestid: result.insertId
                        })
                    }
                } else {
                    reply.send({
                        status: "error",
                        message: "server_error",
                        details: "Ошибка при работе с SQL на этапе выполнения запроса, получено error. Дополнительно: " + err
                    })
                }
            }
        )

    })
}
  
module.exports = create