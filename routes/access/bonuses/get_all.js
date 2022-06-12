async function get_all(fastify, options){
    fastify.get('/get_all', {preHandler: fastify.auth([
        fastify.userAuth
      ])}, async function(request, reply) {

        sql_line = "SELECT id, title, description, price, status, image_codifiator FROM bonuses_partners";
        //We are going to have following statuses for requests:
        // open -- this request is just created and we are looking for volunteer
        // inprogress -- catched up by the volunteer, just "in progress"
        // canceled -- beneficial just canceled this request
        // completed -- beneficial got help
        switch (request.query.byStatus) {
            case "open":
                sql_line += "WHERE status = 'open'";
                break;
            case "inprogress":
                sql_line += "WHERE status = 'inprogress'";
                break;
            case "canceled":
                sql_line += "WHERE status = 'canceled'";
                break;
            case "completed":
                sql_line += "WHERE status ='completed'";
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


  
module.exports = get_all