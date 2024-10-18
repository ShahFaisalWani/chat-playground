from flask import Blueprint

API_PREFIX = '/api'

auth_blueprint = Blueprint('auth', __name__)
chat_blueprint = Blueprint('chat', __name__)

from .auth import *
from .chat import *