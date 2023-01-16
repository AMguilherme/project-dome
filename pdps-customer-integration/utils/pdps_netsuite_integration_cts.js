/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(
    [

    ],
    function () {
        return {
            CUSTOMER: {
                ID: 'customer',
                FIELD_IDS: {
                    INTERNAL_ID: 'internalid',
                    IS_PERSON: 'isperson',
                    SUBSIDIARY: 'subsidiary',
                    FIRST_NAME: 'firstname',
                    LAST_NAME: 'lastname',
                    COMPANY_NAME: 'companyname',
                    EMAIL: 'email',
                    NETSUITE_INTEGRATION_ID: 'custentity_pdps_netsuite_integration_id'
                },
                SUBLISTS: {
                    ADDRESS_BOOK: {
                        ID: 'addressbook',
                        FIELD_IDS: {
                            DEFAULT_SHIPPING: 'defaultshipping',
                            DEFAULT_BILLING: 'defaultbilling',
                            SUBRECORD: 'addressbookaddress',
                            COUNTRY: 'country',
                            STREET: 'addressee',
                            NUMBER: 'addr1',
                            NEIGHBORHOOD: 'addr2',
                            CITY: 'city',
                            STATES: 'state',
                            ZIP: 'zip',
                            NETSUITE_INTEGRATION_ID: 'custrecord_pdps_netsuite_integration_id'
                        }
                    }
                }
            },
            CONTACT: {
                ID: 'contact',
                FIELD_IDS: {
                    INTERNAL_ID: 'internalid',
                    ENTITY_ID: 'entityid',
                    EMAIL: 'email',
                    SUBSIDIARY: 'subsidiary',
                    COMPANY: 'company',
                    NETSUITE_INTEGRATION_ID: 'custentity_pdps_netsuite_integration_id'
                }
            },
            INTEGRATION_LOG: {
                ID: 'customrecord_pdps_net_integration_logs',
                FIELD_IDS: {
                    DATE: 'custrecord_pdps_integration_date',
                    INTEGRATION_ID: 'custrecord_pdps_integration_id',
                    CUSTOMER: 'custrecord_pdps_customer',
                    ERROR_MESSAGE: 'custrecord_pdps_error_message'
                }
            },
            INTEGRATION_SETUP: {
                ID: 'customrecord_pdps_net_integration_setup',
                FIELD_IDS: {
                    API_TOKEN: 'custrecord_pdps_api_token',
                    API_ENDPOINT: 'custrecord_pdps_api_endpoint'
                }
            }
        }
    })