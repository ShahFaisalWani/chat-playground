from .chat import chat_blueprint
from .auth import auth_blueprint

def setup_router(app):
  @app.route('/')
  def index():
    return "Chat Playground Flask Server Running"
  
  app.register_blueprint(auth_blueprint)
  app.register_blueprint(chat_blueprint)