async function auth_sign(fastify, options) {
    fastify.get('/auth_sign', async function (request, reply) {
        /**
         * Верифицирует параметры запуска.
         * @param searchOrParsedUrlQuery
         * @param {string} secretKey
         * @returns {boolean}
         */
        var queryParams = [];
        function verifyLaunchParams(searchOrParsedUrlQuery, secretKey) {
            const crypto = require('crypto');

            let sign;
            //const queryParams = []; - эту переменную я вынес на уровень выше

            /**
             * Функция, которая обрабатывает входящий query-параметр. В случае передачи
             * параметра, отвечающего за подпись, подменяет "sign". В случае встречи
             * корректного в контексте подписи параметра добавляет его в массив
             * известных параметров.
             * @param key
             * @param value
             */
            const processQueryParam = (key, value) => {
                if (typeof value === 'string') {
                    if (key === 'sign') {
                        sign = value;
                    } else if (key.startsWith('vk_')) {
                        queryParams.push({
                            key,
                            value
                        });
                    }
                }
            };

            if (typeof searchOrParsedUrlQuery === 'string') {
                // Если строка начинается с вопроса (когда передан window.location.search),
                // его необходимо удалить.
                const formattedSearch = searchOrParsedUrlQuery.startsWith('?') ?
                    searchOrParsedUrlQuery.slice(1) :
                    searchOrParsedUrlQuery;

                // Пытаемся спарсить строку как query-параметр.
                for (const param of formattedSearch.split('&')) {
                    const [key, value] = param.split('=');
                    processQueryParam(key, value);
                }
            } else {
                for (const key of Object.keys(searchOrParsedUrlQuery)) {
                    const value = searchOrParsedUrlQuery[key];
                    processQueryParam(key, value);
                }
            }
            // Обрабатываем исключительный случай, когда не найдена ни подпись в параметрах,
            // ни один параметр, начинающийся с "vk_", дабы избежать
            // излишней нагрузки, образующейся в процессе работы дальнейшего кода.
            if (!sign || queryParams.length === 0) {
                return false;
            }
            // Снова создаём query в виде строки из уже отфильтрованных параметров.
            const queryString = queryParams
                // Сортируем ключи в порядке возрастания.
                .sort((a, b) => a.key.localeCompare(b.key))
                // Воссоздаём новый query в виде строки.
                .reduce((acc, {
                    key,
                    value
                }, idx) => {
                    return acc + (idx === 0 ? '' : '&') + `${key}=${encodeURIComponent(value)}`;
                }, '');

            // Создаём хеш получившейся строки на основе секретного ключа.
            const paramsHash = crypto
                .createHmac('sha256', secretKey)
                .update(queryString)
                .digest()
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=$/, '');

            return paramsHash === sign;
        }

        const url = request.query.app_url;
        const clientSecret = process.env.vkApp_clientSecret; // Защищённый ключ из настроек вашего приложения

        // Берём только параметры запуска.
        const launchParams = url.slice(url.indexOf('?') + 1);

        const verificationResult = verifyLaunchParams(launchParams, clientSecret)

        // Проверяем, валидны ли параметры запуска.
        if (verificationResult == true) {
            if ( Math.floor((new Date() - queryParams.find(o => o.key === 'vk_ts').value)/60000) < 50000000000000 ) {//5 = 5min
                const crypto = require('crypto')
                var token = crypto.randomBytes(24).toString('hex');
                console.log(token)
                fastify.mysql.query(
                    `INSERT INTO users (vk_userid, token)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE 
                    token = ?`, [queryParams.find(o => o.key === 'vk_user_id').value, token, token],
                    function onResult(err, result) {
                        if(!err){
                            if(result.insertId > 0){
                                reply.send({
                                    status: "okay",
                                    userid: result.insertId,
                                    token: token
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
                
            } else {
                reply.send({
                    status: "error",
                    message: "old_sign"
                })
            }
        } else {
            reply.send({
                status: "error",
                message: "wrong_sign"
            })
        }

    })
}

module.exports = auth_sign