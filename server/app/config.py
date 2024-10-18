from dotenv import load_dotenv
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
server_root = os.path.abspath(os.path.join(current_dir, '..')) 

dotenv_path = os.path.join(server_root, '.env')

load_dotenv(dotenv_path=dotenv_path, override=True)

class Config:
    MONGO_URI = os.getenv('MONGO_URI')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

