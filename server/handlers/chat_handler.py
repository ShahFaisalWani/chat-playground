from flask import jsonify, request, Response
from app.db import mongo
from bson.objectid import ObjectId
from datetime import datetime
from openai import OpenAI
import json
import time
import uuid
from tokenizers import Tokenizer
from app.config import Config
from openai import AuthenticationError

tokenizer = Tokenizer.from_pretrained("gpt2")

TYHOON_API_URL = "https://api.opentyphoon.ai/v1"
TYHOON_API_KEY = Config.OPENAI_API_KEY

client = OpenAI(api_key=TYHOON_API_KEY,base_url=TYHOON_API_URL)
socketio = None

def set_socketio(sio):
    global socketio
    socketio = sio

def new_chat(data):
    chat_id = data.get('chat_id')
    user_id = data.get('user_id')
    user_message = data.get('message')
    message_id = data.get('message_id')
    message_index = data.get('message_index')

    parameters = data.get('parameters', None)
    params = {
        "model": parameters.get('model', "typhoon-v1.5x-70b-instruct"),
        "output_length": parameters.get('output_length', 512),
        "temperature": parameters.get('temperature', 0.6),
        "top_p": parameters.get('top_p', 0.95),
        "repetition_penalty": parameters.get('repetition_penalty', 1.05)
    }

    if not user_id or not user_message:
        return jsonify({'message': 'User ID and message are required'}), 400
        
    if message_id:
        chat = mongo.db.chats.find_one({'_id': ObjectId(chat_id)})
        if not chat:
            return jsonify({'message': 'Chat not found'}), 404

        message_index = message_index if message_index < len(chat['messages']) else next((index for index, msg in enumerate(chat['messages']) if msg['message_id'] == message_id), None)

        if message_index is None:
            return jsonify({'message': 'Message not found'}), 404
        
        chat['messages'][message_index]['content'] = user_message
        new_message_id = chat['messages'][message_index]['message_id']
        messages = chat['messages'][:message_index + 1]
    else:
        new_message_id = str(uuid.uuid4())
        messages = [{"message_id": new_message_id, "role": "user", "content": user_message}]
        if chat_id:
            chat = mongo.db.chats.find_one({'_id': ObjectId(chat_id)})
            if chat:
                messages = chat['messages'] + messages
        else:
            try:
                prompt = [
                    {
                        "role": "system", 
                        "content": "Provide a concise, accurate title from the following user input. Ensure the title directly summarizes the key request. Do NOT include prefixes like 'Title:' or 'Summary:'. The title should be no more than 5 words in English or 10 words in Thai."
                    },
                    {
                        "role": "user",
                        "content": f"User input: {user_message}"
                    }
                ]
                title_response = client.chat.completions.create(
                    model="typhoon-v1.5x-70b-instruct",
                    messages=prompt,
                    temperature=0.5,
                    top_p=0.95,
                    max_tokens=10
                )
                chat_title = title_response.choices[0].message.content.strip()
            except Exception as e:
                return jsonify({'message': 'Failed to generate chat title', 'details': str(e)}), 500

    if chat_id:
        mongo.db.chats.update_one(
            {'_id': ObjectId(chat_id)},
            {'$set': {'messages': messages, 'params': params, 'timestamp': datetime.now()}}
        )
    else:
        new_chat_id = mongo.db.chats.insert_one({
            'user_id': user_id,
            'messages': messages,
            'params': params,
            'chat_title': chat_title,
            'timestamp': datetime.now()
        }).inserted_id
        chat_id = str(new_chat_id)
   
    return jsonify({
        'chat_id': chat_id,
        'message_id': new_message_id,
        'user_message': user_message,
        'chat_title': chat_title if not chat_id else None
    }), 200

def process_streaming(chat_id):
    chat = mongo.db.chats.find_one({'_id': ObjectId(chat_id)})
    if not chat:
        return jsonify({'message': 'Chat not found'}), 404
    
    params = chat.get('params', {
        "model": "typhoon-v1.5x-70b-instruct",
        "output_length": 512,
        "temperature": 0.6,
        "top_p": 0.95,
        "repetition_penalty": 1.05
    })
    
    messages = chat['messages']
    prompt = [{'role': msg['role'], 'content': msg['content']} for msg in messages if 'role' in msg and 'content' in msg]

    new_message_id = str(uuid.uuid4())

    try:
        stream = client.chat.completions.create(
            model=params['model'],
            messages=prompt,
            max_tokens=params['output_length'],
            temperature=params['temperature'],
            top_p=params['top_p'],
            extra_body={"repetition_penalty": params['repetition_penalty']},
            stream=True, 
            stream_options={"include_usage": True}         
        )
        
        def generate():
            start_time = time.time()
            assistant_response = ""
            token_count = 0
            response_time = 0

            yield f"{json.dumps({'event': 'start', 'message_id': new_message_id})}\n\n"

            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content is not None:
                    assistant_response += content
                    token_count += len(tokenizer.encode(content).ids)
                    yield f"{json.dumps({'event':'message','message_id': new_message_id, 'content': content})}\n\n"

            response_time = time.time() - start_time
            
            yield f"{json.dumps({'event': 'complete', 'message_id': new_message_id, 'completion_tokens': token_count, 'response_time': response_time})}\n\n"

            messages.append({
                "message_id": new_message_id,
                "role": "assistant",
                "content": assistant_response,
                "completion_tokens": token_count,
                "response_time": response_time,
            })
            
            mongo.db.chats.update_one(
                {'_id': ObjectId(chat_id)},
                {'$set': {'messages': messages, 'timestamp': datetime.now()}}
            )

        return Response(generate(), content_type='text/event-stream')
    

    except AuthenticationError:
        return jsonify({'message': 'Invalid API Key. Please check your OpenAI API Key.'}), 401

    except Exception as e:
        return jsonify({'message': 'Failed to process the request', 'details': str(e)}), 500


def get_chat_messages(chat_id):
    try:
        chat = mongo.db.chats.find_one({'_id': ObjectId(chat_id)})

        if not chat:
            return jsonify({'message': 'Chat not found'}), 404

        messages = chat.get('messages', [])

        return jsonify({
            'chat_id': chat_id,
            'messages': messages
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

def get_chats(user_id):
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    try:
        chats = mongo.db.chats.find({'user_id': user_id}).sort('timestamp', -1)
        history = []
        for chat in chats:
            history.append({
                'chat_id': str(chat['_id']),
                'chat_title': chat['chat_title'],
                'timestamp': chat['timestamp'],
            })

        return jsonify({
            'user_id': user_id,
            'history': history
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
def vote_message(data):
    chat_id = data.get('chat_id')
    vote_type = data.get('vote_type')
    message_id = data.get('message_id')

    if vote_type not in ['upvote', 'downvote']:
        return jsonify({'message': 'Invalid vote type. Use "upvote" or "downvote".'}), 400

    if not chat_id or not message_id:
        return jsonify({'message': 'Chat ID and message ID are required'}), 400
    
    try:
        chat = mongo.db.chats.find_one({'_id': ObjectId(chat_id)})
        if not chat:
            return jsonify({'message': 'Chat not found'}), 404

        messages = chat.get('messages', [])
        message = next((msg for msg in messages if str(msg['message_id']) == message_id), None)
        if not message:
            return jsonify({'message': 'Message not found'}), 404

        current_vote = message.get('vote')

        if current_vote == vote_type:
            mongo.db.chats.update_one(
                {'_id': ObjectId(chat_id), 'messages.message_id': message_id},
                {'$unset': {'messages.$.vote': ""}} 
            )
        else:
            mongo.db.chats.update_one(
                {'_id': ObjectId(chat_id), 'messages.message_id': message_id},
                {'$set': {'messages.$.vote': vote_type}} 
            )
        
        if socketio:
            socketio.emit('vote_update', {'chat_id': chat_id, 'message_id': message_id, 'vote': vote_type})
        else:
            return jsonify({'message': 'SocketIO not initialized'}), 500

        return jsonify({'message': 'Vote updated'}), 200

    except Exception as e:
        return jsonify({'message': 'An error occurred while voting', 'details': str(e)}), 500

def delete_chat(chat_id):
    if not chat_id:
        return jsonify({'message': 'Chat ID is required'}), 400
    try:
        result = mongo.db.chats.delete_one({'_id': ObjectId(chat_id)})

        if result.deleted_count == 0:
            return jsonify({'message': 'Chat not found'}), 404

        if socketio:
            socketio.emit('chat_deleted', {'chat_id': chat_id})
        else:
            return jsonify({'message': 'SocketIO not initialized'}), 500

        return jsonify({'message': 'Chat deleted successfully'}), 200

    except Exception as e:
        return jsonify({'message': 'An error occurred while deleting the chat', 'details': str(e)}), 500