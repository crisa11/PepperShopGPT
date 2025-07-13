class CustomerServiceClient {
    
    static CustomerAction = class {
        constructor(type, properties = {}){
            this.type = type
            this.properties = properties
        }
        
        toServerObj(){
            return { 
                "action_type": this.type,
                "action_properties": this.properties
            }
        }
    }

    // Movimenti e gesture per Pepper (mantenuti dal codice originale)
    static MOVE_NAMES = {
        bothArmsBumpInFront: "bothArmsBumpInFront", 
        fancyRightArmCircle: "fancyRightArmCircle", 
        normalPosture: "normalPosture",
        welcomeGesture: "welcomeGesture",
        pointingGesture: "pointingGesture",
        thinkingGesture: "thinkingGesture"
    };
    
    static EYE_PARTS = {Both:"Both", Left:"Left", Right:"Right"}

    constructor({receiveListener = (command) => {}, onConnect = () => {}, onDisconnect = () => {}}){
        // RAIM Client
        this.RAIMClient = new RAIMClient("customer_service_client");
        this.RAIMClient.debug = false;
        this.RAIMClient.setCommandListener(receiveListener);
        this.RAIMClient.onDisconnect = onDisconnect;
        
        this.RAIMClient.connect(...RAIMgetWebsocketUrlParams()).then(onConnect);
    }

    sendAction(action, request = true) {
        let command_in = new RAIMClient.Command({
            data: {
                "actions": [action.toServerObj()]
            },
            to_client_id: "customer_service_server",
            request: request,
        });
        return this.RAIMClient.dispatchCommand(command_in)
    }

    // ========== CUSTOMER SERVICE ACTIONS ==========

    quit(){
        let action = new CustomerServiceClient.CustomerAction("quit")
        return this.sendAction(action, false);
    }

    endInteraction(request = true){
        let action = new CustomerServiceClient.CustomerAction("end_interaction")
        return this.sendAction(action, request);
    }

    // NATURAL LANGUAGE QUERY
    
    sendNaturalQuery(query, name, request = true){
        let action = new CustomerServiceClient.CustomerAction("natural_query", {
            user_name: name,
            query: query
        })
        return this.sendAction(action, request);
    }
}

class CustomerServiceManager {
    constructor({lang = "EN", onConnect = () => {}} = {}){
        this.client = new CustomerServiceClient({onConnect})
        this.lang = lang
        this.productId = null
        this.productName = null
        this.sessionActive = true
        this.interactionHistory = []
        this.lastResponse = null
    }

    // ========== UPDATED: RESPONSE PARSING ==========
    
    parseResponse(command){
        // Handle new GPT response format
        if (command.data) {
            // New GPT format: structured JSON response
            if (command.data.action_type && command.data.message) {
                return {
                    action_type: command.data.action_type,
                    message: command.data.message,
                    data: command.data.data || {},
                    is_successful: command.data.is_successful !== false,
                    ...command.data.data // Spread additional data
                }
            }
            // Legacy format fallback
            return command.data.action_properties || command.data
        }
        return {}
    }

    // ========== SESSION MANAGEMENT ==========

    async startCustomerSession(customerName){
        try {
            const response = await this.client.introduceCustomer(customerName).then(this.parseResponse).then(({response})=>response)
            this.customerName = customerName
            this.customerId = response.customer_id || response.data?.customer_id
            this.sessionActive = true
            this.lastResponse = response
            this.addToHistory('introduction', response.message || response.welcome_message)
            return response
        } catch (error) {
            console.error("Errore nell'avvio sessione:", error)
            throw error
        }
    }

    async endCustomerSession(){
        try {
            const response = await this.client.endInteraction().then(this.parseResponse.bind(this))
            this.sessionActive = false
            this.lastResponse = response
            this.addToHistory('farewell', response.message || response.farewell_message)
            return response
        } catch (error) {
            console.error("Errore nella chiusura sessione:", error)
            throw error
        }
    }

    
    // ========== NATURAL LANGUAGE PROCESSING ==========

    async sendNaturalQuery(query, user_name){
        if (!this.sessionActive) {
            throw new Error("Sessione non attiva. Avvia prima una sessione cliente.")
        }
        
        try {
            const response = await this.client.sendNaturalQuery(query, user_name).then(this.parseResponse.bind(this))
            this.lastResponse = response
            return response
        } catch (error) {
            console.error("Errore nella query naturale:", error)
            throw error
        }
    }

    // ========== UTILITY METHODS ==========


    /*getSessionInfo(){
        return {
            customerId: this.customerId,
            customerName: this.customerName,
            sessionActive: this.sessionActive,
            interactionCount: this.interactionHistory.length,
            lastResponse: this.lastResponse
        }
    }*/

    reset(){
        this.productId = null
        this.productName = null
        this.sessionActive = false
        this.interactionHistory = []
        this.lastResponse = null
    }

    // ========== UPDATED: CONVENIENCE METHODS ==========

    async handleCustomerQuery(query, user_name){
        try {
            console.log("Sto provando la natural query")
            return await this.sendNaturalQuery(query, user_name)
        } catch (error) {
            console.warn("Fallback to legacy query handling:", error)
        }
    }

    // ========== RESPONSE HELPERS ==========

    getResponseMessage(response){
        return response?.message || response?.welcome_message || response?.farewell_message || "Risposta ricevuta"
    }

    getResponseData(response){
        return response?.data || {}
    }

    isResponseSuccessful(response){
        return response?.is_successful !== false
    }

    getNameFromResponse(response){
        return response?.data?.name || response?.name || []
    }

    getLocationFromResponse(response){
        return response?.data?.location || response?.location || []
    }

    getPriceFromResponse(response){
        return response?.data?.price || response?.price || []
    }

    getImageFromResponse(response){
        return response?.data?.image_path || response?.data?.image || response?.data?.icon || []
    }

    getAgeFromResponse(response){
        return response?.data?.age || response?.data?.overage || []
    }
}