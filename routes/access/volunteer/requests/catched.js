async function catched(fastify, options){
    fastify.get('/catched', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {

        sql_line = "SELECT id, owner, status, assigned_volunteer, notes, grade, subject, files FROM requests WHERE assigned_volunteer = ? ";
        //We are going to have following statuses for requests:
        // open -- this request is just created and we are looking for volunteer
        // inprogress -- catched up by the volunteer, just "in progress"
        // canceled -- beneficial just canceled this request
        // completed -- beneficial got help
        switch (request.query.byStatus) {
            case "open":
                sql_line += "AND status = 'open'";
                break;
            case "inprogress":
                sql_line += "AND status = 'inprogress'";
                break;
            case "canceled":
                sql_line += "AND status = 'canceled'";
                break;
            case "completed":
                sql_line += "AND status ='completed'";
                break;
            default:
                //nothing on this step
                break;
        }

        fastify.mysql.query(
            sql_line, [request.query.user_id],
            function onResult(err, result) {
                reply.send({
                    status: "okay",
                    result: result,
                    err: err
                })
            }
        )

    })
}


  
module.exports = catched