/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(
    [
        '../utils/pdps_netsuite_integration_api_wrapper_md',
        '../utils/pdps_netsuite_integration_search_utils_md',
        '../utils/pdps_netsuite_integration_record_utils_md'
    ],
    function (wrapper, searchUtils, recordUtils) {
        function getInputData(context) {
            const apiWrapper = new wrapper()
            return apiWrapper.netsuiteIntegration.getCustomers()
        }

        function map(context) {
            var customerCreation = {}
            var customerUpdate = {}
            var contactCreation = {}
            var contactUpdate = {}
            const customer = JSON.parse(context.value)
            const contacts = customer.contactList
            const integrationId = customer.id
            const customerInternalId = searchUtils.fetchCustomerInternalId(integrationId)
            const isCustomerExistent = customerInternalId ? true : false

            if (!isCustomerExistent) {
                customerCreation = recordUtils.createCustomer(customer)
                log.audit('customerCreation', customerCreation)
            } else {
                customerUpdate = recordUtils.updateCustomer(customerInternalId, customer)
                log.audit('customerUpdate', customerUpdate)
            }

            const postIntegrationCustomerInternalId = customerInternalId || customerCreation.customer_internal_id

            if (postIntegrationCustomerInternalId) {
                contacts.forEach(function (contact) {
                    var contactIntegrationId = contact.id
                    var contactInternalId = searchUtils.fetchContactInternalId(postIntegrationCustomerInternalId, contactIntegrationId)

                    const isContactExistent = contactInternalId ? true : false

                    if (!isContactExistent) {
                        contactCreation = recordUtils.createContact(postIntegrationCustomerInternalId, contact)
                        log.audit('contactCreation', contactCreation)
                    } else {
                        contactUpdate = recordUtils.updateContact(postIntegrationCustomerInternalId, contactInternalId, contact)
                        log.audit('contactUpdate', contactUpdate)
                    }
                })
            }

            const integrationLogObject = _buildIntegraionLogObject(postIntegrationCustomerInternalId, integrationId, customerCreation, customerUpdate, contactCreation, contactUpdate)
            log.audit('integrationLogObject', integrationLogObject)

            recordUtils.createIntegrationLogRecord(integrationLogObject)
        }

        function summarize(summary) {
            const inputSummaryError = summary.inputSummary.error
            if (inputSummaryError) {
                log.error({ title: 'Input Error', details: inputSummaryError })
            }
            summary.mapSummary.errors.iterator().each(function (key, error) {
                log.error({ title: 'Map Error for key: ' + key, details: error })
                return true
            })
        }

        function _buildIntegraionLogObject(customerInternalId, integrationId, customerCreation, customerUpdate, contactCreation, contactUpdate) {
            const customerCreationErros = customerCreation.error_message ? ('Ao criar o cliente: ' + customerCreation.error_message + '\n') : ''
            const customerUpdateErros = customerUpdate.error_message ? ('Ao atualizar o cliente: ' + customerUpdate.error_message + '\n') : ''
            const contactCreationErrors = contactCreation.error_message ? ('Ao criar os contatos: ' + contactCreation.error_message + '\n') : ''
            const contactUpdateErrors = contactUpdate.error_message ? ('Ao atualizar os contatos: ' + contactUpdate.error_message + '\n') : ''
            const integrationErrors = customerCreationErros + customerUpdateErros + contactCreationErrors + contactUpdateErrors

            return {
                integration_id: integrationId,
                integration_date: new Date(),
                customer_internal_id: customerInternalId,
                integration_errors: integrationErrors.slice(0, 300)
            }
        }


        return {
            getInputData: getInputData,
            map: map,
            summarize: summarize
        }
    })