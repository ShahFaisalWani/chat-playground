import logging

def setup_logging():
    logging.basicConfig(level=logging.WARNING)

    logging.getLogger('pymongo').setLevel(logging.ERROR)
    logging.getLogger('httpx').setLevel(logging.ERROR)
    logging.getLogger('openai').setLevel(logging.ERROR)
    logging.getLogger('gunicorn').setLevel(logging.ERROR)
    logging.getLogger('httpcore').setLevel(logging.ERROR)
    logging.getLogger('ERROR').setLevel(logging.ERROR)

    logger = logging.getLogger('app')
    logger.setLevel(logging.INFO)
    logger.info("Logging has been set up.")
