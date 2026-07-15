# utils/threads.py
from concurrent.futures import ThreadPoolExecutor

# Spawns up to 4 background worker threads inside your web server instance.
# This handles heavy distance operations without freezing your web endpoints.
bg_executor = ThreadPoolExecutor(max_workers=4)
