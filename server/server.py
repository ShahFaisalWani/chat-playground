import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from routes.router import setup_router
from app.db import setup_db
from flask_socketio import SocketIO
from handlers.chat_handler import set_socketio
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.exceptions import NotFound
from app.logger import setup_logging 

setup_logging()

app = Flask(__name__)
CORS(app)

setup_db(app)
setup_router(app)

socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet', path='/ws')
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")


set_socketio(socketio)

hostedApp = Flask(__name__)
hostedApp.wsgi_app = DispatcherMiddleware(NotFound(), {'/api': app})

