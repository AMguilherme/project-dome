/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(
    [
        'N/error',
        '../utils/pdps_netsuite_integration_cts.js'
    ],
    function (error, cts) {
        function beforeSubmit(context) {
            const oldRecord = context.oldRecord
            const newRecord = context.newRecord
            const netsuiteIntegrationId = newRecord.getValue({ fieldId: cts.CUSTOMER.FIELD_IDS.NETSUITE_INTEGRATION_ID })
            log.audit('runing', 'runing')

            if (!netsuiteIntegrationId || (context.type != context.UserEventType.EDIT && context.type != context.UserEventType.XDIT)) return

            const oldEmail = oldRecord.getValue({ fieldId: cts.CUSTOMER.FIELD_IDS.EMAIL })
            const newEmail = newRecord.getValue({ fieldId: cts.CUSTOMER.FIELD_IDS.EMAIL })
            const billingAddressWasEdited = _verifyBillingAddressEdition(oldRecord, newRecord)
            log.audit('edition data', {
                oldEmail: oldEmail,
                newEmail: newEmail,
                billingAddressWasEdited: billingAddressWasEdited
            })

            if (oldEmail != newEmail || billingAddressWasEdited) {
                throw error.create({
                    name: 'EMAIL_AND_BILLING_ADDRESS_CAN_NOT_BE_EDITED',
                    message: 'O e-mail e os dados do endereço de faturamento não podem ser alterados devido o cadastro do cliente ser via integração.',
                    notifyOff: true
                })
            }
        }

        function _verifyBillingAddressEdition(customerOldRecord, customerNewRecord) {
            var billingAddressWasEdited = false
            const billingAddressLine = customerNewRecord.findSublistLineWithValue({
                sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID,
                fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.DEFAULT_BILLING,
                value: 'T'
            })
            log.audit('billingAddressLine', billingAddressLine)

            if (billingAddressLine == -1) return false

            const fieldsToCompare = [
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.COUNTRY,
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.STREET,
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.NUMBER,
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.NEIGHBORHOOD,
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.CITY,
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.STATES,
                cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.ZIP
            ]

            const oldAddressSubrecord = customerOldRecord.getSublistSubrecord({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.SUBRECORD, line: billingAddressLine })
            const newAddressSubrecord = customerNewRecord.getSublistSubrecord({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.SUBRECORD, line: billingAddressLine })


            fieldsToCompare.forEach(function (field) {
                var oldFieldValue = oldAddressSubrecord.getValue({ fieldId: field })
                var newFieldValue = newAddressSubrecord.getValue({ fieldId: field })
                log.audit('address values', {
                    old_value: field + ' ' + oldFieldValue,
                    new_value: field + ' ' + newFieldValue
                })

                if (oldFieldValue != newFieldValue) billingAddressWasEdited = true
            })

            return billingAddressWasEdited
        }

        return {
            beforeSubmit: beforeSubmit
        }
    })