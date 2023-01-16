/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(
    [
        'N/https',
        'N/error',
        '../utils/pdps_netsuite_integration_search_utils_md.js'
    ],
    function (https, error, searchUtils) {
        return function () {
            const integrationSetup = searchUtils.fetchIntegrationSetup()
            const basicAuth = 'Basic ' + integrationSetup.api_token

            const headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
                'Authorization': basicAuth
            }

            this.netsuiteIntegration = {
                getCustomers: function () {
                    const response = https.get({
                        url: integrationSetup.api_endpoint,
                        headers: headers
                    })

                    return _handleResponse(response)
                }
            }
        }

        function _handleResponse(response) {
            const body = JSON.parse(response.body)

            if (response.code == 200 || response.code == 201) {
                return body
            } else {
                throw error.create({
                    name: 'GET_CUSTOMERS_ERROR',
                    message: response.body,
                    notifyOff: true
                })
            }
        }
    })