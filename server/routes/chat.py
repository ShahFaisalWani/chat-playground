from flask import jsonify, request
from handlers.chat_handler import new_chat, process_streaming, get_chats, get_chat_messages, vote_message, delete_chat
from . import chat_blueprint
from middlewares.auth_middleware import token_required

@chat_blueprint.route('/chats', methods=['POST'])
@token_required
def create_chat():
    data = request.json
    return new_chat(data)

@chat_blueprint.route('/chats/stream', methods=['POST', 'GET'])
@token_required
def stream_chat():
    chat_id = request.args.get('chat_id')

    if not request.user_id or not chat_id:
        return jsonify({'message': 'User ID and Chat ID are required'}), 400    

    return process_streaming(chat_id)

@chat_blueprint.route('/chats/<chat_id>/messages', methods=['GET'])
@token_required
def get_messages(chat_id):
    return get_chat_messages(chat_id)   

@chat_blueprint.route('/chats', methods=['GET'])
@token_required
def get_user_chats():
    user_id = request.args.get('user_id')
    return get_chats(user_id)

@chat_blueprint.route('/chats/vote', methods=['POST'])
@token_required
def vote_on_message():
    data = request.json
    return vote_message(data)

@chat_blueprint.route('/chats/delete', methods=['POST'])
@token_required
def delete_chat_route():
    data = request.json
    chat_id = data.get('chat_id')
    return delete_chat(chat_id)
