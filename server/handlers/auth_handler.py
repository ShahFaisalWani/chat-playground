import jwt
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from flask import jsonify
from app.db import mongo

SECRET_KEY = os.getenv('JWT_SECRET')

def generate_token(user):
    payload = {
        'user_id': str(user['_id']),
        'username': user['username'],
        'email': user['email'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def register_user(data):
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')

    if not email or not password or not username:
        return jsonify({'message': 'Email, username, and password are required'}), 400
    
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already registered'}), 400
    
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'message': 'Username already taken'}), 400

    hashed_password = generate_password_hash(password)
    user_id = mongo.db.users.insert_one({
        'email': email,
        'username': username,
        'password': hashed_password
    }).inserted_id

    user = mongo.db.users.find_one({'_id': ObjectId(user_id)})

    token = generate_token(user)

    return jsonify({'message': 'User registered successfully', 'token': token, 'username': user['username']}), 201

def login_user(data):
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    
    user = mongo.db.users.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Email or Password is incorrect'}), 401

    token = generate_token(user)

    return jsonify({'message': 'Logged in successfully', 'token': token}), 200

def get_user_by_id(user_id):
    try:
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})

        if not user:
            return jsonify({'message': 'User not found'}), 404

        user_data = {
            'user_id': str(user['_id']),
            'username': user.get('username'),
            'email': user.get('email'),
        }

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
