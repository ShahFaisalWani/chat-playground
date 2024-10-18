from flask import request
from . import auth_blueprint
from handlers.auth_handler import register_user, login_user, get_user_by_id
from middlewares.auth_middleware import token_required

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.json
    return register_user(data)

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.json
    return login_user(data)

@auth_blueprint.route('/users/<user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    return get_user_by_id(user_id)
