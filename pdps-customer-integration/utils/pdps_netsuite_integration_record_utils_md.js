/**
 * @NApiVersion 2.x
 * @NModuleScope Public  
 */
define(
    [
        'N/record',
        '../utils/pdps_netsuite_integration_cts.js'
    ],
    function (record, cts) {
        const subsidiary = 12

        function createCustomer(customer) {
            var customerInternalId, errorMessage

            try {
                const integrationId = customer.id
                const customerFullName = customer.fullName
                const customerEmail = customer.email
                const customerAddresses = customer.addressList
                log.audit('customerEmail', customerEmail)

                const customerRecord = record.create({ type: cts.CUSTOMER.ID, isDynamic: true })

                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.NETSUITE_INTEGRATION_ID, value: integrationId })
                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.SUBSIDIARY, value: subsidiary })
                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.COMPANY_NAME, value: customerFullName })
                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.EMAIL, value: customerEmail })

                customerAddresses.forEach(function (address) {
                    _setCustomerAddress(customerRecord, address)
                })

                customerInternalId = customerRecord.save()
            } catch (e) {
                errorMessage = e.message
            }

            return {
                customer_internal_id: customerInternalId,
                error_message: errorMessage
            }
        }

        function updateCustomer(customerInternalId, customer) {
            var errorMessage

            try {
                const integrationId = customer.id
                const customerFullName = customer.fullName
                const customerEmail = customer.email
                const customerAddresses = customer.addressList
                const subsidiary = 12
                log.audit('customerEmail', customerEmail)

                const customerRecord = record.load({ type: cts.CUSTOMER.ID, id: customerInternalId, isDynamic: true })

                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.NETSUITE_INTEGRATION_ID, value: integrationId })
                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.SUBSIDIARY, value: subsidiary })
                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.COMPANY_NAME, value: customerFullName })
                customerRecord.setValue({ fieldId: cts.CUSTOMER.FIELD_IDS.EMAIL, value: customerEmail })

                customerAddresses.forEach(function (address) {
                    var addressId = (address.id).toString()
                    var addressLineToUpdate = _fetchAddressLineToUpdate(customerRecord, addressId)
                    log.audit('addressLineToUpdate', addressLineToUpdate)
                    _setCustomerAddress(customerRecord, address, addressLineToUpdate)
                })

                customerRecord.save()
            } catch (e) {
                errorMessage = e.message
            }

            return {
                customer_internal_id: customerInternalId,
                error_message: errorMessage
            }
        }

        function createContact(customerInternalId, contact) {
            var contactInternalId, errorMessage

            try {
                const integrationId = contact.id
                const contactName = contact.name
                const contactEmail = contact.email

                const contactRecord = record.create({ type: cts.CONTACT.ID, isDynamic: true })

                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.NETSUITE_INTEGRATION_ID, value: integrationId })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.SUBSIDIARY, value: subsidiary })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.ENTITY_ID, value: contactName })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.EMAIL, value: contactEmail })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.COMPANY, value: customerInternalId })

                contactInternalId = contactRecord.save()
            } catch (e) {
                errorMessage = e.message
            }

            return {
                contact_internal_id: contactInternalId,
                error_message: errorMessage
            }
        }

        function updateContact(customerInternalId, contactInternalId, contact) {
            var errorMessage

            try {
                const integrationId = contact.id
                const contactName = contact.name
                const contactEmail = contact.email

                const contactRecord = record.load({ type: cts.CONTACT.ID, id: contactInternalId, isDynamic: true })

                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.NETSUITE_INTEGRATION_ID, value: integrationId })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.SUBSIDIARY, value: subsidiary })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.ENTITY_ID, value: contactName })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.EMAIL, value: contactEmail })
                contactRecord.setValue({ fieldId: cts.CONTACT.FIELD_IDS.COMPANY, value: customerInternalId })

                contactRecord.save()
            } catch (e) {
                errorMessage = e.message
            }

            return {
                contact_internal_id: contactInternalId,
                error_message: errorMessage
            }
        }

        function createIntegrationLogRecord(integrationLogObject) {
            const integrationLogRecord = record.create({ type: cts.INTEGRATION_LOG.ID, isDynamic: true })

            integrationLogRecord.setValue({ fieldId: cts.INTEGRATION_LOG.FIELD_IDS.INTEGRATION_ID, value: integrationLogObject.integration_id })
            integrationLogRecord.setValue({ fieldId: cts.INTEGRATION_LOG.FIELD_IDS.DATE, value: new Date(integrationLogObject.integration_date) })
            integrationLogRecord.setValue({ fieldId: cts.INTEGRATION_LOG.FIELD_IDS.CUSTOMER, value: integrationLogObject.customer_internal_id })
            integrationLogRecord.setValue({ fieldId: cts.INTEGRATION_LOG.FIELD_IDS.ERROR_MESSAGE, value: integrationLogObject.integration_errors })

            integrationLogRecord.save()
        }

        function _setCustomerAddress(customerRecord, address, lineToUpdate) {

            if (lineToUpdate) {
                customerRecord.selectLine({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, line: lineToUpdate })
            } else {
                customerRecord.selectNewLine({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID })
            }

            if (address.type == 'billing-address') customerRecord.setCurrentSublistValue({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.DEFAULT_BILLING, value: true })
            if (address.type == 'shipping-address') customerRecord.setCurrentSublistValue({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.DEFAULT_SHIPPING, value: true })

            const addressSubrecord = customerRecord.getCurrentSublistSubrecord({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.SUBRECORD })

            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.STREET, value: address.street })
            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.NUMBER, value: address.number })
            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.NEIGHBORHOOD, value: address.neighborhood })
            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.ZIP, value: address.zipCode })
            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.STATES, value: address.stateCode })
            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.CITY, value: address.city })
            addressSubrecord.setValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.NETSUITE_INTEGRATION_ID, value: address.id })

            customerRecord.commitLine({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID })
        }

        function _fetchAddressLineToUpdate(customerRecord, addressId) {
            var lineToUpdate
            const addressLines = customerRecord.getLineCount({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID })

            for (var i = 0; addressLines > i; i++) {
                customerRecord.selectLine({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, line: i })
                var addressSubrecord = customerRecord.getCurrentSublistSubrecord({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.SUBRECORD })
                var currentAddressId = addressSubrecord.getValue({ fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.NETSUITE_INTEGRATION_ID })

                if (currentAddressId == addressId) lineToUpdate = i
            }

            return lineToUpdate
        }

        return {
            createCustomer: createCustomer,
            updateCustomer: updateCustomer,
            createContact: createContact,
            updateContact: updateContact,
            createIntegrationLogRecord: createIntegrationLogRecord
        }
    })