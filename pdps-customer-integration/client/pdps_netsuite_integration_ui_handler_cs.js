/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(
    [
        'N/ui/message',
        'N/ui/dialog',
        '../utils/pdps_netsuite_integration_cts.js'
    ],
    function (message, dialog, cts) {
        function pageInit(context) {
            const currentRecord = context.currentRecord
            const netsuiteIntegrationId = currentRecord.getValue({ fieldId: cts.CUSTOMER.FIELD_IDS.NETSUITE_INTEGRATION_ID })

            if (!netsuiteIntegrationId) return

            _showLockEdibleMessage()

            const emailField = currentRecord.getField({ fieldId: cts.CUSTOMER.FIELD_IDS.EMAIL })
            emailField.isDisabled = true
        }

        function validateLine(context) {
            const currentRecord = context.currentRecord
            const netsuiteIntegrationId = currentRecord.getValue({ fieldId: cts.CUSTOMER.FIELD_IDS.NETSUITE_INTEGRATION_ID })
            const isBilingAddress = currentRecord.getCurrentSublistValue({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID, fieldId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.FIELD_IDS.DEFAULT_BILLING })
            const sublistId = context.sublistId

            if (!netsuiteIntegrationId || !isBilingAddress || sublistId != cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID) return true

            dialog.alert({
                title: 'Alerta!',
                message: 'Os dados do endereço de faturamento não podem ser alterados devido o cadastro do cliente ser via integração.'
            })

            currentRecord.cancelLine({ sublistId: cts.CUSTOMER.SUBLISTS.ADDRESS_BOOK.ID })

            return false
        }

        function _showLockEdibleMessage() {
            message.create({
                title: 'Informação.',
                message: 'O e-mail e os dados do endereço de faturamento não podem ser alterados devido o cadastro do cliente ser via integração.',
                type: message.Type.INFORMATION
            })
                .show({ duration: 20000 })
        }

        return {
            pageInit: pageInit,
            validateLine: validateLine
        }
    })