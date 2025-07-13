import os, sys, uuid, tempfile, json
from RAIM.ipc_client import IPCClient
from RAIM.raim_command import Command

import argparse
import time
import re
from openai import AzureOpenAI

DIR = os.path.realpath(os.path.dirname(__file__))

AZURE_API_KEY = os.getenv("AZURE_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
API_VERSION = "2024-08-01-preview"

class CustomerInteraction:
    def __init__(self, ipc_server_host, ipc_server_port, products_database_path, 
                 azure_api_key=None, azure_endpoint=None, debug=False, **kwargs) -> None:
        self.ipc = IPCClient("customer_service_server")
        self.products_database_path = products_database_path
        self.active_customers = {}
        self.ipc.debug = debug
        
        # Initialize Azure OpenAI client (stesso setup del codice funzionante)
        self.client = AzureOpenAI(
            api_key=AZURE_API_KEY,
            azure_endpoint=AZURE_ENDPOINT,
            api_version=API_VERSION
        )
        
        # Load products database
        self.products_db = self.load_products_database()
        
        # Create Assistant (come nel codice funzionante)
        self.assistant = self._create_assistant()
        
        print(f"Customer interaction server started with Azure Assistant ID: {self.assistant.id}")
        self.ipc.set_command_listener(self.request_listener)
        self.ipc.connect(host=ipc_server_host, port=ipc_server_port)
        print("Connection to ipc completed!")

    def _create_assistant(self):
        """Create the Azure OpenAI Assistant with product database knowledge"""
        system_instructions = f"""You are Pepper, a virtual assistant for a supermarket. You can help customers with these:
        1. Product location in the store
        2. Price information
        3. Product descriptions

        You have an available product database in JSON format:
        {json.dumps(self.products_db, indent=2, ensure_ascii=False)}

        Always respond in a polite and professional manner. If the client name is provided, use it in the response but not to greet it. 
        When a customer asks for information:
        - Use the data from the database to provide accurate information
        - If a product is not found, suggest similar alternatives
        - Always provide the price and location when relevant
        - Maintain a friendly and helpful tone
        - Do not put questions in your responses

        Your responses must be in JSON format with the following structure:
        {{
            "action_type": "type_of_action",
            "message": "message for the customer",
            "data": {{
                //specific action-related data
                'location': product location from the database
                'name': product name from the database
                'price': product price from the database
                'image_path': product image_path from the database
                'overage': product overage from the database
            }},
            "is_successful": true/false
        }}
        Note that if the request is in italian languge you have to respond in italian language, otherwise in english language"""

        # Create assistant (stesso metodo del codice funzionante)
        assistant = self.client.beta.assistants.create(
            name="Pepper Store Assistant",
            instructions=system_instructions,
            model="gpt-4.1"  # Stesso modello del codice funzionante
        )
        
        return assistant

    def _get_or_create_thread(self, customer_id):
        """Get or create a thread for a specific customer"""
        if customer_id not in self.active_customers:
            self.active_customers[customer_id] = {
                "thread": self.client.beta.threads.create(),
                "queries_count": 0,
                "name": "Cliente"
            }
        return self.active_customers[customer_id]["thread"]

    def _query_assistant(self, customer_id, user_input, user_name, action_type=None):
        """Query Azure Assistant using the same mechanism as the working code"""
        try:
            # Get or create thread for this customer
            thread = self._get_or_create_thread(customer_id)
            
            # Increment query count
            self.active_customers[customer_id]["queries_count"] += 1
            
            # Prepare the user message based on action type
            if action_type:
                user_message = f"Action type:{action_type}\nCLient name: {user_name}\nClient request: {user_input}"
            else:
                user_message = user_input
            
            # Create message in thread (stesso metodo del codice funzionante)
            message = self.client.beta.threads.messages.create(
                thread_id=thread.id,
                role='user',
                content=user_message
            )
            
            # Create and run the assistant (stesso metodo del codice funzionante)
            run = self.client.beta.threads.runs.create(
                assistant_id=self.assistant.id,
                thread_id=thread.id
            )
            
            # Wait for completion (stesso loop del codice funzionante)
            while run.status in ['queued', 'in_progress', 'cancelling']:
                time.sleep(1)
                run = self.client.beta.threads.runs.retrieve(
                    thread_id=thread.id,
                    run_id=run.id
                )
            
            if run.status == 'completed':
                # Get the latest message (stesso metodo del codice funzionante)
                messages = self.client.beta.threads.messages.list(
                    thread_id=thread.id
                )
                latest_message = next(msg for msg in messages if msg.role == 'assistant')
                
                # Clean the message (stesso metodo del codice funzionante)
                response_text = re.sub(r"【.*?】", "", latest_message.content[0].text.value)
                
                # Try to parse JSON response
                try:
                    response_data = json.loads(response_text)
                    return response_data, True
                except json.JSONDecodeError:
                    # If not JSON, create a simple response structure
                    return {
                        "action_type": action_type or "general_response",
                        "message": response_text,
                        "data": {},
                        "is_successful": True
                    }, True
            else:
                print(f"Assistant run failed with status: {run.status}")
                return {
                    "action_type": "error",
                    "message": "Technical error. Retry.",
                    "data": {"error": f"Run status: {run.status}"},
                    "is_successful": False
                }, False
                
        except Exception as e:
            print(f"Error querying Azure Assistant: {e}")
            return {
                "action_type": "error",
                "message": "Technical error. Retry.",
                "data": {"error": str(e)},
                "is_successful": False
            }, False

    def shutdown(self):
        print("Shutting down the server...")
        # Cleanup: delete assistant if needed
        try:
            self.client.beta.assistants.delete(self.assistant.id)
            print(f"Deleted assistant {self.assistant.id}")
        except:
            pass
        self.ipc.disconnect()

    def load_products_database(self):
        try:
            if os.path.exists(self.products_database_path):
                with open(self.products_database_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                return self.create_sample_database()
                print("JSON not found, using base database")
        except Exception as e:
            print(f"Error loading products database: {e}")
            return self.create_sample_database()
    
    def create_sample_database(self):
        return {
            "products": [
                {
                    "id": "001",
                    "name": "Latte",
                    "category": "Latticini",
                    "price": 1.49,
                    "location": "Corsia 5, Scaffale B2",
                    "description": "Latte intero fresco da allevamenti locali",
                    "availability": "Disponibile",
                    "keywords": ["latte", "latticini", "fresco"]
                },
                {
                    "id": "002",
                    "name": "Pasta Spaghetti",
                    "category": "Pasta",
                    "price": 0.89,
                    "location": "Corsia 3, Scaffale A1",
                    "description": "Pasta di grano duro, ideale per ogni tipo di sugo",
                    "availability": "Disponibile",
                    "keywords": ["pasta", "spaghetti", "grano duro"]
                },
                {
                    "id": "003",
                    "name": "Mele Golden",
                    "category": "Frutta",
                    "price": 2.99,
                    "location": "Corsia 1, Scaffale Frutta Fresca",
                    "description": "Mele dolci e croccanti di stagione",
                    "availability": "Disponibile",
                    "keywords": ["mele", "frutta", "fresca"]
                }
            ],
            "categories": [
                {"name": "Latticini", "location": "Corsia 5"},
                {"name": "Pasta", "location": "Corsia 3"},
                {"name": "Frutta", "location": "Corsia 1"}
            ]
        }

    def send_response(self, command_in, action=None, is_successful=False):
        if command_in.request:
            command_out = command_in.gen_response(is_successful=is_successful, data=action)
        else:
            command_out = Command(
                data=action,
                to_client_id=command_in.from_client_id
            )
        print(f"Customer Interaction Server responding to {command_out.to_client_id} with: {command_out.data}\n")
        self.ipc.dispatch_command(command_out)

    def request_listener(self, command: Command):
        #print("Ciao sono nel listener")
        if "actions" in command.data:
            action = command.data["actions"][0]
            action_type = action["action_type"]
            action_properties = action.get("action_properties", {})

            print(f"{command.from_client_id} requesting to Customer Service Server: {command.data}\n")

            if action_type == "quit":
                self.shutdown()
                return
            
            elif action_type == "end_interaction":
                customer_name = "Cliente"
                if command.from_client_id in self.active_customers:
                    customer_name = self.active_customers[command.from_client_id].get("name", "Cliente")
                    # Don't delete here, let it be cleaned up naturally
                
                farewell_message = f"Arrivederci {customer_name}!"
                response_action, is_successful = self._query_assistant(
                    command.from_client_id,
                    farewell_message,
                    "end_interaction"
                )
                
                self.send_response(command_in=command, action=response_action, is_successful=is_successful)

            else: 
                action_type == "natural_query"
                # Handle natural language queries
                user_query = action_properties.get("query", "")
                user_name = action_properties.get("user_name", "")
                
                response_action, is_successful = self._query_assistant(
                    command.from_client_id,
                    user_query,
                    user_name,
                    "natural_query"
                )
                
                self.send_response(command_in=command, action=response_action, is_successful=is_successful)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Customer Service Server with Azure Assistant API')
    parser.add_argument('--ipc_server_host', type=str, default='localhost', 
                       help='IPC server hostname (default: localhost)')
    parser.add_argument('--ipc_server_port', type=int, default=5001, 
                       help='IPC server port number (default: 5001)')
    parser.add_argument('--products_database_path', type=str, default=f"{DIR}/Products/supermarket_database.json", 
                       help="Path to products database JSON file")
    parser.add_argument('--azure_api_key', type=str, required=False, help='Azure OpenAI API key')
    parser.add_argument('--azure_endpoint', type=str, required=False, help='Azure OpenAI endpoint URL')
    parser.add_argument('--debug', type=bool, default=False, help='Print debug infos (default: False)')
    
    args = vars(parser.parse_args())

    cs_server = None
    try:
        cs_server = CustomerInteraction(**args)
    except KeyboardInterrupt:
        if cs_server:
            cs_server.shutdown()