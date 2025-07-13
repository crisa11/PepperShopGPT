const pepper_feedback = new PepperFeedback("pepper_feeedback", "/assets/");
const video = document.getElementById(`video${config.show_video_always?"_debug":""}`);
const video_back = document.getElementById('video_back');
const label_pepper_see = document.getElementById('label_pepper_see');
const label_explanation = document.getElementById('label_pepper_see');
const prp_title = document.getElementById("prp_title");
const cropped_unk_face = document.getElementById('cropped_unk_face');
const cropped_unk_face_text = document.getElementById('cropped_unk_face_text');
const container = document.getElementById('product_image_container');
const image = document.getElementById('product_image');
        


class App {
    constructor(
        {
            min_ms_interval = 400,
            unknown_face_threshold = 4,
            chosen_one_max_threshold = 8,
            camera_type = config.camera_type,
            lang = "en-US",
            debug = true,
        }
    ) {

        this.initState();
        this.console = new BetterConsole({ enabled: debug });
        this.stt = new SpeechRecognitionBrowser(lang);
        this.languageText = new LanguageText(
            lang,
            {
                "YES": {
                    "en-US": "yes",
                    "it-IT": "si"
                },
                "NO": {
                    "en-US": "no",
                    "it-IT": "no"
                },
                "DETECT_NEW_FACES": {
                    "en-US": "Hi!",
                    "it-IT": "Ciao!"
                },
                "PEPPER_WHAT_IS_FACE_NAME": {
                    "en-US": "What is the name of this person?",
                    "it-IT": "Qual'è il nome di questa persona?"
                },
                "PEPPER_WHAT_IS_FACE_NAME_CONFIRMATION": {
                    "en-US": "So the name is %s, correct?",
                    "it-IT": "Quindi il nome è %s, corretto?"
                },
                "PEPPER_WHAT_IS_FACE_NAME_CONFIRMATION_YES": {
                    "en-US": "Ok, nice to meet you!",
                    "it-IT": "Ok, piacere di conoscerti!"
                },
                "PEPPER_WHAT_IS_FACE_NAME_CONFIRMATION_NO": {
                    "en-US": "The name is not correct? Let's retry",
                    "it-IT": "Non è corretto? Allora riproviamo"
                },
                "PEPPER_WHAT_IS_FACE_AGE": {
                    "en-US": "And how old are you?",
                    "it-IT": "E quanti anni hai?"
                },
                "PEPPER_WHAT_IS_FACE_AGE_CONFIRMATION": {
                    "en-US": "So the age is %s, correct?",
                    "it-IT": "Quindi l'età è %s, corretto?"
                },
                "PEPPER_WHAT_IS_FACE_AGE_CONFIRMATION_YES": {
                    "en-US": "Ok!",
                    "it-IT": "Ok!"
                },
                "PEPPER_WHAT_IS_FACE_AGE_CONFIRMATION_NO": {
                    "en-US": "The age is not correct? Let's retry",
                    "it-IT": "Non è corretto? Allora riproviamo"
                },  
                "PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION": {
                    "en-US": "So you said %s, correct?",
                    "it-IT": "Quindi hai detto %s, corretto?"
                },
                "PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION_YES": {
                    "en-US": "Ok!",
                    "it-IT": "Ok!"
                },
                "PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION_NO": {
                    "en-US": "It's not not correct? Let's retry",
                    "it-IT": "Non e' corretto? Allora riproviamo"
                },

                "PEPPER_WHAT_IS_FACE_ALL_CONFIRMATION": {
                    "en-US": "So the name is %s, you are a %s and the age is %s, correct?",
                    "it-IT": "Quindi il nome è %s, sei un %s e l'età è %s, corretto?"
                },
                "PEPPER_WHAT_IS_FACE_ALL_CONFIRMATION_YES": {
                    "en-US": "Ok!",
                    "it-IT": "Ok!"
                },
                "PEPPER_WHAT_IS_FACE_ALL_CONFIRMATION_NO": {
                    "en-US": "They are not correct? Let's retry",
                    "it-IT": "Non son corretti? Allora riproviamo"
                },
                "PEPPER_NO_HEAR": {
                    "en-US": "I didn't hear your response, please speak up",
                    "it-IT": "Non ho sentito la tua risposta, per favore alza la voce"
                },
                "PEPPER_LOST_CHOSEN_ONE": {
                    "en-US": "Oh no, I lost you. Come back whenever you want!",
                    "it-IT": "Oh no, ti ho perso di vista. Ritorna quando vuoi!"
                },
                "PEPPER_EXPERT_USER_INTRO": {
                    "en-US": "Welcome back %s! Do you want me to help you again?",
                    "it-IT": "Ciao di nuovo %s! Hai bisogno ancora del mio aiuto?"
                },
                "PEPPER_NEW_USER_INTRO": {
                    "en-US": "So, %s, do you need help with something?",
                    "it-IT": "%s hai bigogno di aiuto?"
                },
                "PEPPER_ASK": {
                    "en-US": "%s, do you need help with something?",
                    "it-IT": "%s, posso aiutarti con qualcosa?"
                },

                "PEPPER_ASK_AGAIN": {
                    "en-US": "%s, do you need help with something else?",
                    "it-IT": "%s, posso aiutarti con qualcos'altro?"
                },

                "PEPPER_EXPLAIN_0": {
                    "en-US": "Hi! I'm PepperShop and I am here to help you with shopping.",
                    "it-IT": "Ciao! Io sono PepperShop e sono qui per aiutarti con la tua spesa."
                },
                "PEPPER_EXPLAIN_1": {
                    "en-US": "You can ask me where to find a product, and I will tell it to you.",
                    "it-IT": "Puoi chiedermi dove trovare un prodotto e te lo dirò.",
                },
                "PEPPER_EXPLAIN_2": {
                    "en-US": "You can ask me about the price of a certain product.",
                    "it-IT": "Puoi chiedermi informazioni riguardo ai prezzi dei vari prodotti."
                },
                "PEPPER_EXPLAIN_3": {
                    "en-US": "Or you can also ask me detailed information about a product!",
                    "it-IT": "O puoi anche chiedermi informazioni dettagliate sui prodotti!"
                },

                "PEPPER_START": {
                    "en-US": "Ok! What do you need?",
                    "it-IT": "Ok! Di cosa hai bisogno?"
                },

                "PEPPER_OVER_AGE": {
                    "en-US": "You said to be %s, so you're too young for %s",
                    "it-IT": "Hai detto di avere %s anni, quindi sei troppo piccolo per %s"
                },
                "PEPPER_INTERACTION_FINISHED": {
                    "en-US": "Ok, thank you! Come back if you need some help!",
                    "it-IT": "Ok, grazie! Torna se hai bisogno di aiuto!"
                },
                "TERMS_AND_CONDITIONS": {
                    "en-US": "Before we start, I need to inform you that I will store your profile for providing personalized assistance. Do you agree to proceed?",
                    "it-IT": "Prima di iniziare, devo informarti che salverò i tuoi dati personali per fornirti assistenza personalizzata. Sei d'accordo a procedere?"
                },
                "TERMS_ACCEPTED": {
                    "en-US": "Thank you for your consent.",
                    "it-IT": "Grazie per il tuo consenso."
                },
                "TERMS_DECLINED": {
                    "en-US": "I understand, I won't store your profile.",
                    "it-IT": "Capisco, non salverò i tuoi dati personali."
                },
                
            },
            (lang) => {
                this.stt.recognition.lang = lang;
            }
        );

        this.console.log("Chosen min_ms_time:", min_ms_interval, "Chosen camera:", camera_type);

        this.min_ms_interval = min_ms_interval;
        this.unknown_face_threshold = unknown_face_threshold;
        this.CHOSEN_ONE_MAX_THRESHOLD = chosen_one_max_threshold;
        this.camera_type = camera_type;
        this.last_frame_time = Date.now();
        this.no_hear_counter = 0;

        this.pepper = new PepperClient({
            onConnect: async () => {
                try {
                    await this.pepper.stand(true);
                    this.console.log("Pepper connected.");
                }
                catch (error) {
                    this.console.error("Something went wrong on the pepper server");
                }
            }
        });
        
        this.faceRecognition = new FaceRecognitionClient({
            receiveListener: this.listenerFaceRecognition.bind(this),
            onConnect: this.initFaceRecognition.bind(this)
        });
        this.customerServiceManager = new CustomerServiceManager({
            lang: lang,
            onConnect: async () => {
                try {
                    this.console.log("Customer service connected.");
                }
                catch (error) {
                    this.console.error("Something went wrong on the story telling server");
                }
            }
        })

    }


    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initState() {
        this.state = {
            "starting_page": "index_page",
            "camera_enabled": false,
            "camera_enabled_errors": 0,
            "chosen_one": undefined,
            "is_chosen_one_new": false,
            "cropped_unknown_faces": {},
            "new_faces": [],
            "chosen_one_threshold": 0,
            "user_consent": null,
            "explanation_completed": false,
        }

        this.routing = new Routing(this.state.starting_page);   
    }

    async askForConsent() {

        if (this.state.user_consent==null)
        {
            pepper_feedback.speak();
            label_explanation.innerText = this.languageText.get("TERMS_AND_CONDITIONS");
            await this.pepper.sayMove(
                this.languageText.get("TERMS_AND_CONDITIONS"),
                PepperClient.MOVE_NAMES.fancyRightArmCircle,
                true
            );

            while (true) {
                try {
                    pepper_feedback.hear();
                    let consent_response = await this.stt.startListening();
                    
                    if (consent_response.toLowerCase() == this.languageText.get("YES").toLowerCase()) {
                        this.state.user_consent = true;
                        pepper_feedback.speak();
                        label_explanation.innerText = this.languageText.get("TERMS_ACCEPTED");
                        await this.pepper.sayMove(
                            this.languageText.get("TERMS_ACCEPTED"),
                            PepperClient.MOVE_NAMES.excited,
                            true
                        );
                        await this.sleep(2000);
                        pepper_feedback.default();
                        return;
                    }
                    else if (consent_response.toLowerCase() == this.languageText.get("NO").toLowerCase()) {
                        this.state.user_consent = false;
                        pepper_feedback.speak();
                        label_explanation.innerText = this.languageText.get("TERMS_DECLINED");
                        await this.pepper.sayMove(
                            this.languageText.get("TERMS_DECLINED"),
                            PepperClient.MOVE_NAMES.bothArmsBumpInFront,
                            true
                        );
                        await this.sleep(2000);
                        pepper_feedback.default();
                        return;
                    }
                    else {
                        pepper_feedback.speak();
                        await this.pepper.sayMove(
                            this.languageText.get("TERMS_AND_CONDITIONS"),
                            PepperClient.MOVE_NAMES.fancyRightArmCircle,
                            true
                        );
                    }
                } catch (error) {
                    this.console.error("Error getting consent:", error);
                    pepper_feedback.no_hear();
                    await this.pepper.sayMove(
                        this.languageText.get("PEPPER_NO_HEAR"),
                        PepperClient.MOVE_NAMES.confused,
                        true
                    );
                    await this.sleep(1000);
                }
            }
        }else return true
    }

    parseUser(filename) {  
        if (filename == undefined) return undefined;
        const parts = filename.split("#");
        const userObject = {
            name: parts[0],
            age: isNaN(parseInt(parts[1])) ? undefined : parseInt(parts[1]),
        };
        return userObject;
    }

    formatUser(name, age = undefined) {
        return `${name}${age != undefined ? "#" + age : ""}`; 
    }

    async initFaceRecognition() {

        this.console.log("Face recognition connected");
        try {
            await this.faceRecognition.initFaceRecognition(this.unknown_face_threshold);
            this.console.log("Starting camera service...");
            await this.startCamera();

            if (!this.state.explanation_completed) {
                await this.explainFunctionalityToUser();
                this.state.explanation_completed = true;
            }

        } catch (error) {
            this.console.error("Something went wrong on the face recognition server");
        }
    }

    async startCamera() {
        if (this.state.camera_enabled) {
            console.log('Camera is already enabled!');
            return;
        }
        let isEnabled = false;
        switch (this.camera_type) {
            default:
                this.camera_type = "browser";
            case "browser":
                isEnabled = await this.startCameraBrowser();
                break;
            case "robot":
                isEnabled = await this.startCameraRobot();
                break;
        }
        await this.checkIfVideoIsEnabled(isEnabled);
    }

    async startCameraBrowser() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            this.console.log("Cameras discovered:", videoDevices);
            if (videoDevices.length > 0) {
                const device = videoDevices[0];
                this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } });
                video.srcObject = this.cameraStream;
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    stopCameraBrowser() {
        if (this.cameraStream) {
            this.console.log("Stopping camera browser");
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null; 
        }
    }

    async startCameraRobot() {
        try {
            await this.pepper.startVideo(true);
            return true;
        } catch (error) {
            return false;
        }
    }

    async checkIfVideoIsEnabled(isEnabled) {
        if (isEnabled) {
            this.state.camera_enabled = true;
            this.console.log(`Camera ${this.camera_type} enabled!`);
            this.sendFrameCameraRequestDeltaTime();
            //await this.explainFunctionalityToUser();
        }
        else if (!isEnabled && this.camera_enabled_errors < 1) {
            this.console.error(`Camera not enabled using ${this.camera_type}, trying the other one...`);
            this.camera_enabled_errors += 1;
            if (this.camera_type == "browser") {
                this.camera_type = "robot";
                await this.startCameraRobot();
                //await this.explainFunctionalityToUser();
            } else {
                this.camera_type = "browser";
                await this.startCameraBrowser();
                //await this.explainFunctionalityToUser();
            }

        }
        else {
            this.console.error(`Camera not enabled, tried ${this.camera_enabled_errors} times`);
        }
    }

    async sendFrameCameraRequestDeltaTime() {
        
        let deltaTime = Date.now() - this.last_frame_time;
        if (deltaTime < this.min_ms_interval) deltaTime = this.min_ms_interval;
        else deltaTime = 1;
        await this.sleep(deltaTime);
        this.last_frame_time = Date.now();
        
        let isSuccessful = await this.sendFrameCameraRequest();
        this.console.log("Image frame sent.");
        if (!isSuccessful) {
            this.console.error("Image frame not sent, retrying...");
            await this.sendFrameCameraRequestDeltaTime();
        }
    }

    async sendFrameCameraRequest() {
        try {
            if (this.camera_type == "browser") {
                let imgBase64 = this.getFrameCameraBrowser();
                this.faceRecognition.sendFrame(imgBase64, false);                 return true;
            }
            else if (this.camera_type == "robot") {
                let imgBase64 = await this.pepper.takeFakeVideoFrame(true); 
                this.faceRecognition.sendFrame(imgBase64, false); 
                return true;
            }
        } catch (error) {
            return false;
        }

    }

    getFrameCameraBrowser() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64ImageData = canvas.toDataURL('image/jpeg');
        return base64ImageData;
    }

    async listenerFaceRecognition(command) {

        if (!this.state.explanation_completed) {
            await this.sendFrameCameraRequestDeltaTime();
            return;
        }


        if (["known_faces", "cropped_unknown_faces"].every(key => command.data.hasOwnProperty(key))) {
            let known_faces_names = Object.keys(command.data["known_faces"]);

            this.console.log("knownfaces", known_faces_names);
            this.console.log("Current chosen one:", this.state.chosen_one)
            this.console.log("Current treshold:", this.state.chosen_one_threshold)

            if (this.state.chosen_one != undefined) {
                if (known_faces_names.includes(this.state.chosen_one)) {this.state.chosen_one_threshold = 0;this.console.log("chosen one still visible->threshold=0");}
                else {this.state.chosen_one_threshold += 1;this.console.log("chosen one not visible->threshold+1", this.state.chosen_one_threshold)}

                if (this.state.chosen_one_threshold >= this.CHOSEN_ONE_MAX_THRESHOLD) {
                    this.console.log("threshold>8")
                    this.state.chosen_one = undefined;
                    this.state.is_chosen_one_new = false;
                    pepper_feedback.speak();
                    let message = this.languageText.get("PEPPER_LOST_CHOSEN_ONE")
                    label_explanation.innerText = message
                    await this.pepper.sayMove(
                        message,
                        PepperClient.MOVE_NAMES.confused,
                        true
                    );
                    pepper_feedback.default();
                    this.console.log("Pepper lost the chosen one!");
                    location.reload();
                }
            }
            else {
                if (known_faces_names.length > 0) {
                    let chosen_one = known_faces_names[0];
                    this.state.chosen_one = known_faces_names[0];
                    this.console.log("Setting chosen one", this.state.chosen_one)
                    if (this.state.new_faces.includes(chosen_one)) this.state.is_chosen_one_new = true;
                    await this.initialTalkToUser(this.state.is_chosen_one_new);
                    pepper_feedback.hear();
                    let customer_answer = await this.stt.startListening();
                    this.console.log("Customer Answer", customer_answer);
                    pepper_feedback.default();
                    await this.startInteraction(customer_answer);
                    pepper_feedback.visible();
                }
                else if (Object.keys(command.data["cropped_unknown_faces"]).length > 0) {
                    this.console.log("PHASE UNKNOWN: adding new faces!");
                    await this.askForConsent();
                    this.routing.goToPage("new_face_page");
                    await this.setNewFacesNames(command);
                }
            }

            let out_text = "";
            if (this.state.chosen_one != undefined) {
                let user = this.parseUser(this.state.chosen_one);
                if (this.state.is_chosen_one_new) out_text = this.languageText.get("PEPPER_ASK").replace('%s', user.name);
                else out_text = this.languageText.get("PEPPER_EXPERT_USER_INTRO").replace('%s', user.name);
            }
            else {
                out_text = this.languageText.get("DETECT_NEW_FACES")
            }
            label_pepper_see.innerText = out_text;
        }

        await this.sendFrameCameraRequestDeltaTime();
    }


    async setNewFacesNames(command) {
        const objList = [];
        for (const key in command.data["cropped_unknown_faces"]) {
            const value = command.data["cropped_unknown_faces"][key];
            const pair = [key, value];
            objList.push(pair);
        }
        await this.setNewFaceName(command, objList, 0);
    }
    async getFaceInfo(
        languageTextPhrase, pepperClientMoveName,
        languageTextConfirmation,
        languageTextConfirmationYes, languageTextConfirmationNo
    ) {
        while (true) {
            try {
                cropped_unk_face_text.innerText = this.languageText.get(languageTextPhrase)
                pepper_feedback.speak();
                await this.pepper.sayMove(
                    this.languageText.get(languageTextPhrase),
                    pepperClientMoveName,
                    true
                );
                pepper_feedback.hear();
                let info_text = await this.stt.startListening();

                let conf_text = this.languageText.get("PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION").replace('%s', info_text);
                cropped_unk_face_text.innerText = conf_text;
                pepper_feedback.speak();
                await this.pepper.sayMove(
                    conf_text,
                    PepperClient.MOVE_NAMES.fancyRightArmCircle,
                    true
                );
                pepper_feedback.hear();
                let confirm_text = await this.stt.startListening();

                if (confirm_text.toLowerCase() == this.languageText.get("YES").toLowerCase()) {
                    pepper_feedback.speak();
                    cropped_unk_face_text.innerText = this.languageText.get("PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION_YES");
                    await this.pepper.sayMove(
                        this.languageText.get("PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION_YES"),
                        PepperClient.MOVE_NAMES.bothArmsBumpInFront,
                        true
                    );
                    pepper_feedback.default();
                    return info_text;
                }
                else {
                    pepper_feedback.speak();
                    cropped_unk_face_text.innerText = this.languageText.get("PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION_NO");
                    await this.pepper.sayMove(
                        this.languageText.get("PEPPER_WHAT_IS_FACE_INFO_CONFIRMATION_NO"),
                        PepperClient.MOVE_NAMES.bothArmsBumpInFront,
                        true
                    );
                }
            } catch (error) {
                this.console.log("An error occurred (propbably no response)");
                this.console.error(error);
                cropped_unk_face_text.innerText = this.languageText.get("PEPPER_NO_HEAR");
                pepper_feedback.no_hear();
                await this.pepper.sayMove(
                    this.languageText.get("PEPPER_NO_HEAR"),
                    PepperClient.MOVE_NAMES.confused,
                    true
                );
                await this.sleep(500);
            }
        }
    }
    async setNewFaceName(command, objList, idx) {
        if (objList.length <= idx) {
            try {
                let command_out = await this.faceRecognition.setUnknownFaces(this.state.cropped_unknown_faces, true);
                this.console.log("Success! Setting new faces on the state...");
                this.state.new_faces = this.state.new_faces.concat(command_out.data["new_faces"]);
            } catch (error) {
                this.console.error("Error on setting the new faces:", error);
            } finally {
                this.console.log("Going back to face selection...");
                pepper_feedback.default();
                this.routing.goBack();
                return;
            }

        };
        let [key, value] = objList[idx];
        cropped_unk_face.src = value;
        
        try {
            let name_text = await this.getFaceInfo(
                "PEPPER_WHAT_IS_FACE_NAME", PepperClient.MOVE_NAMES.bothArmsBumpInFront,
            );

            let age_text = await await this.getFaceInfo(
                "PEPPER_WHAT_IS_FACE_AGE", PepperClient.MOVE_NAMES.bothArmsBumpInFront,
            );

            pepper_feedback.speak();
            cropped_unk_face_text.innerText = this.languageText.get("PEPPER_WHAT_IS_FACE_ALL_CONFIRMATION_YES");
            await this.pepper.sayMove(
                this.languageText.get("PEPPER_WHAT_IS_FACE_ALL_CONFIRMATION_YES"),
                PepperClient.MOVE_NAMES.bothArmsBumpInFront,
                true
            );
            pepper_feedback.default();
            this.state.cropped_unknown_faces[key] = this.formatUser(name_text, age_text);
            this.state.new_faces.push(name_text);
            await this.setNewFaceName(command, objList, idx + 1);

        } catch (error) {
            this.console.log("An error occurred (propbably no response)");
            this.console.error(error);
            cropped_unk_face_text.innerText = this.languageText.get("PEPPER_NO_HEAR");
            pepper_feedback.no_hear();
            await this.pepper.sayMove(
                this.languageText.get("PEPPER_NO_HEAR"),
                PepperClient.MOVE_NAMES.fancyRightArmCircle,
                true
            );
            await this.sleep(1000);
            await this.setNewFaceName(command, objList, idx);
        }


    }

    async initialTalkToUser(newUser) {
        let user = this.parseUser(this.state.chosen_one);
        let txt = "";
        if (newUser) {
            txt = this.languageText.get("PEPPER_NEW_USER_INTRO").replace('%s', user.name);
        }
        else {
            txt = this.languageText.get("PEPPER_EXPERT_USER_INTRO").replace('%s', user.name);
        }
        label_explanation.innerText = txt;
        pepper_feedback.speak();
        await this.pepper.sayMove(
            txt,
            PepperClient.MOVE_NAMES.fancyRightArmCircle,
            true
        );
        while (true) {
            try {
                pepper_feedback.hear();
                let confirm_text = await this.stt.startListening();
                if (confirm_text.toLowerCase() == this.languageText.get("YES").toLowerCase()) {
                    this.console.log("User needs help: response yes");
                    //await this.explainFunctionalityToUser();
                    label_explanation.innerText = this.languageText.get("PEPPER_START");
                    pepper_feedback.speak();
                    await this.pepper.sayMove(
                        this.languageText.get("PEPPER_START"),
                        PepperClient.MOVE_NAMES.fancyRightArmCircle,
                        true
                    );
                    await this.sleep(1000)
                    //pepper_feedback.default();
                    return true
                }
                else {
                    this.console.log("User needs help: response no");
                    await this.finishInteraction();
                }
            } catch (error) {
                this.console.error(error);
                label_explanation.innerText = this.languageText.get("PEPPER_NO_HEAR").replace('%s', user.name);
                pepper_feedback.no_hear();
                await this.pepper.sayMove(
                    this.languageText.get("PEPPER_NO_HEAR").replace('%s', user.name),
                    PepperClient.MOVE_NAMES.confused,
                    true
                );
                this.sleep(2000);

                label_explanation.innerText = this.languageText.get("PEPPER_ASK").replace('%s', user.name);
                pepper_feedback.speak();
                await this.pepper.sayMove(
                    this.languageText.get("PEPPER_ASK").replace('%s', user.name),
                    PepperClient.MOVE_NAMES.curious,
                    true
                );
            }
        }
    }

    async explainFunctionalityToUser() {
        let movements = [
            PepperClient.MOVE_NAMES.bothArmsBumpInFront,
            PepperClient.MOVE_NAMES.excited,
            PepperClient.MOVE_NAMES.fancyRightArmCircle,
            PepperClient.MOVE_NAMES.bothArmsBumpInFront,
            PepperClient.MOVE_NAMES.fancyRightArmCircle,
            PepperClient.MOVE_NAMES.excited,
        ];
        pepper_feedback.speak();
        for (let i = 0; i <= 3; i++) {
            let txt = this.languageText.get(`PEPPER_EXPLAIN_${i}`);
            label_explanation.innerText = txt;
            await this.pepper.sayMove(
                txt,
                movements[i % movements.length],
                true
            );
            await this.sleep(500);
        }
        pepper_feedback.default();
        this.console.log("Asking for consent first.");
    
    }

    async startInteraction(customer_answer) {
        this.console.log("Starting interaction");
        let user = this.parseUser(this.state.chosen_one)
        try {
            const response = await this.customerServiceManager.handleCustomerQuery(customer_answer, user.name)

            if (this.customerServiceManager.isResponseSuccessful(response) !== false)
            { 
        
                let message = this.customerServiceManager.getResponseMessage(response)
                //let data = this.customerServiceManager.getResponseData(response)
                let product_image_path = this.customerServiceManager.getImageFromResponse(response)
                let age = this.customerServiceManager.getAgeFromResponse(response)
                let product_name = this.customerServiceManager.getNameFromResponse(response)

                let overage = await this.checkAge(age,product_name,user)
                if (!overage) {
                    await this.askForMoreHelp();
                    return;
                }

                this.console.log("Message :", message)
                this.console.log("Image :", product_image_path)
                this.console.log("Age: ", age)

                pepper_feedback.speak();
                label_explanation.innerText = message  
                this.showProductImage(product_image_path);
                await this.pepper.sayMove(
                    message,
                    PepperClient.MOVE_NAMES.fancyRightArmCircle,
                    true
                );
                await this.sleep(6500);
                await this.askForMoreHelp();
                

            }else {
                this.console.log("is_successful field in the response is false")
                await this.handleInteractionError();                
            }

        }catch (error) 
        {
            this.console.error(error);
            await this.handleInteractionError();
        }
    }

    async checkAge(age, product_name, user)
    {
        if (age == 'True') 
        {   
            if (this.languageText.lang == 'en-US' && user.age < 21)
                {
                    this.console.log("2 if")
                    let txt = this.languageText.get("PEPPER_OVER_AGE").replace('%s',user.age).replace('%s',product_name)
                    label_explanation.innerText = txt;
                    pepper_feedback.speak()
                    await this.pepper.sayMove(
                        txt,
                        PepperClient.MOVE_NAMES.thinking,
                        true
                    );
                    await this.sleep(2000);
                    pepper_feedback.default();
                    return false 
                }

            else if (this.languageText.lang == 'it-IT' && user.age < 18)
                {
                    this.console.log("3 if")
                    let txt = this.languageText.get("PEPPER_OVER_AGE").replace('%s',user.age).replace('%s',product_name)
                    label_explanation.innerText = txt;
                    pepper_feedback.speak()
                    await this.pepper.sayMove(
                        txt,
                        PepperClient.MOVE_NAMES.thinking,
                        true
                    );
                    await this.sleep(2000);
                    pepper_feedback.default(); 
                    return false
                }
            else
            {
                return true
            }
        }
        else 
        {
            return true
        }
    }

    showProductImage(imagePath) {
        if (imagePath && imagePath.trim() !== '') {
            const tempImg = new Image()
            tempImg.onload = function(){
                image.src = imagePath;
                container.style.display = 'block';
                setTimeout(() => {
                    container.classList.add("show")
                    pepper_feedback.speak()},
                    100)
                }
            tempImg.onerror = function() {
                container.style.display = 'none';
                container.classList.remove('show')
                pepper_feedback.speak()
            };
            /*
            image.onload = function() {
                container.style.display = 'block';
                container.style.opacity = '0';
                container.style.transition = 'opacity 0.5s ease-in-out';
                setTimeout(() => {container.style.opacity = '1'; pepper_feedback.default()}, 10);
            };*/
            tempImg.src = imagePath;
        } else {
            container.style.display = 'none';
            container.classList.remove('show')
            pepper_feedback.speak()   
        }
    }

    async askForMoreHelp()
    {
        if (this.state.chosen_one != undefined){
            let user = this.parseUser(this.state.chosen_one);
            try
            {
                container.style.display = 'none';
                container.classList.remove('show')
                await this.sleep(500);

                let txt = this.languageText.get("PEPPER_ASK_AGAIN").replace('%s', user.name);
                label_explanation.innerText = txt;
                pepper_feedback.speak();
                await this.pepper.sayMove(
                    txt,
                    PepperClient.MOVE_NAMES.curious,
                    true
                );
                await this.sleep(1000);

                pepper_feedback.hear();
                let confirm_text = await this.stt.startListening();
                if (confirm_text.toLowerCase() == this.languageText.get("YES").toLowerCase()) {
                    this.console.log("User needs help: response yes again");
                    label_explanation.innerText = this.languageText.get("PEPPER_START");
                    pepper_feedback.speak();
                    await this.pepper.sayMove(
                        this.languageText.get("PEPPER_START"),
                        PepperClient.MOVE_NAMES.fancyRightArmCircle,
                        true
                    );
                    await this.sleep(1000);

                    pepper_feedback.hear();
                    let customer_answer = await this.stt.startListening();
                    this.console.log("Customer Answer", customer_answer);
                    pepper_feedback.default();
                    await this.startInteraction(customer_answer)
                }
                else if(confirm_text.toLowerCase() == this.languageText.get("NO").toLowerCase())
                {
                    this.console.log("User finished Interaction")
                    await this.finishInteraction();
                }
            }catch(error){
                this.console.error("Error asking for more help:", error);
                await this.finishInteraction()
            }       
        }else this.finishInteraction();
       
    }

    async handleInteractionError() {

        this.no_hear_counter +=1

        if (this.no_hear_counter >= 3) await this.finishInteraction() 
        
        this.console.log("Handling unsuccessful response");
        label_explanation.innerText = this.languageText.get("PEPPER_NO_HEAR");
        pepper_feedback.no_hear();
        await this.pepper.sayMove(
            this.languageText.get("PEPPER_NO_HEAR"),
            PepperClient.MOVE_NAMES.confused,
            true
        );
        await this.sleep(3000);
    
        await this.askForMoreHelp();
    }

    async finishInteraction() {

        let txt = this.languageText.get("PEPPER_INTERACTION_FINISHED");
        label_explanation.innerText = txt;
        pepper_feedback.speak();
        await this.pepper.sayMove(
            txt,
            PepperClient.MOVE_NAMES.fancyRightArmCircle,
            true
        );
        pepper_feedback.default();

        if (this.state.user_consent === false) {
            this.console.log("User had declined consent, deleting their data");
            await this.deleteUserData();
        }
        
        await this.sleep(10000)
        this.console.log("reset")
        this.state.chosen_one = undefined;
        this.state.is_chosen_one_new = false;
        location.reload();

    }

    async deleteUserData() {
        if (this.state.chosen_one) {
            try {
                await this.faceRecognition.deleteUser(this.state.chosen_one);
                this.console.log("User data deleted for:", this.state.chosen_one);
            } catch (error) {
                this.console.error("Error deleting user data:", error);
            }
    }
}

}

(() => {
    let app = new App({});
})();