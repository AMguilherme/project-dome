/**
 * @NApiVersion 2.x
 * @NModuleScope Public  
 */
define(
    [
        'N/search',
        '../utils/pdps_netsuite_integration_cts.js'
    ],
    function (search, cts) {
        function fetchIntegrationSetup() {
            return search.create({
                type: cts.INTEGRATION_SETUP.ID,
                filters:
                    [],
                columns:
                    [
                        search.createColumn({ name: cts.INTEGRATION_SETUP.FIELD_IDS.API_TOKEN }),
                        search.createColumn({ name: cts.INTEGRATION_SETUP.FIELD_IDS.API_ENDPOINT })
                    ]
            })
                .run()
                .getRange({
                    start: 0,
                    end: 1
                })
                .map(function (res) {
                    return {
                        api_token: res.getValue(res.columns[0]),
                        api_endpoint: res.getValue(res.columns[1])
                    }
                })[0]
        }

        function fetchCustomerInternalId(integrationId) {
            return search.create({
                type: cts.CUSTOMER.ID,
                filters:
                    [
                        [cts.CUSTOMER.FIELD_IDS.NETSUITE_INTEGRATION_ID, 'contains', integrationId],
                    ],
                columns:
                    [
                        search.createColumn({ name: cts.CUSTOMER.FIELD_IDS.INTERNAL_ID })
                    ]
            })
                .run()
                .getRange({
                    start: 0,
                    end: 1
                })
                .map(function (res) {
                    return res.getValue(res.columns[0])
                })[0]
        }

        function fetchContactInternalId(customerInternalId, contactIntegrationId) {
            return search.create({
                type: cts.CONTACT.ID,
                filters:
                    [
                        [cts.CONTACT.FIELD_IDS.COMPANY, 'anyof', customerInternalId],
                        'AND',
                        [cts.CONTACT.FIELD_IDS.NETSUITE_INTEGRATION_ID, 'is', contactIntegrationId]
                    ],
                columns:
                    [
                        search.createColumn({ name: cts.CONTACT.FIELD_IDS.INTERNAL_ID })
                    ]
            })
                .run()
                .getRange({
                    start: 0,
                    end: 1
                })
                .map(function (res) {
                    return res.getValue(res.columns[0])
                })[0]
        }

        return {
            fetchIntegrationSetup: fetchIntegrationSetup,
            fetchCustomerInternalId: fetchCustomerInternalId,
            fetchContactInternalId: fetchContactInternalId
        }
    })