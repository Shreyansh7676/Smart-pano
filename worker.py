import os
import logging

from dotenv import load_dotenv
from redis import Redis
from rq import Queue
from rq.worker import SimpleWorker


RQ_QUEUE_NAME = "stitch"
load_dotenv()
REDIS_URL = os.environ.get("REDIS_URL")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    if REDIS_URL:
        redis_conn = Redis.from_url(REDIS_URL)
        logger.info("Connecting to Redis using REDIS_URL")
    else:
        redis_conn = Redis()
        logger.info("Connecting to local Redis at localhost:6379")

    logger.info("Starting RQ worker for queue: %s", RQ_QUEUE_NAME)
    queue = Queue(RQ_QUEUE_NAME, connection=redis_conn)
    worker = SimpleWorker([queue], connection=redis_conn)
    worker.work()


if __name__ == "__main__":
    main()
