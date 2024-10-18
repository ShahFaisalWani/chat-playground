from flask_pymongo import PyMongo
from .config import Config
from pymongo.errors import ServerSelectionTimeoutError

mongo = PyMongo()

def setup_db(app):
  app.config.from_object(Config)
  mongo.init_app(app)

  try:
      mongo.cx.server_info()
      print("Connected to MongoDB")
  except ServerSelectionTimeoutError:
      print("Failed to connect to MongoDB")