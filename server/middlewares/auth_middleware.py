from functools import wraps
from flask import request, jsonify
import jwt  
import os

SECRET_KEY = os.getenv('JWT_SECRET')

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            if "Bearer " in token:
                token = token.split(" ")[1]

            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            token_user_id = payload.get('user_id')
            request.user_id = token_user_id

            if not token_user_id:
                return jsonify({'message': 'Invalid token!'}), 401

            json_data = request.get_json(silent=True)
            request_user_id = kwargs.get('user_id') or (json_data and json_data.get('user_id')) or request.args.get('user_id')

            if request_user_id and token_user_id != request_user_id:
                return jsonify({'message': 'User ID does not match!'}), 403
        
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            return jsonify({'message': 'An error occurred while verifying token!', 'message': str(e)}), 401

        return f(*args, **kwargs)

    return decorated_function
