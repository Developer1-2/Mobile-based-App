import hashlib
import random
import string
from rapidfuzz import fuzz
import re


def generate_tracking_code():
    """
    Generate a unique tracking code in format GU-XXXX (random 4-digit numbers).
    
    Returns:
        str: Tracking code like 'GU-1234'
    """
    random_numbers = ''.join(random.choices(string.digits, k=4))
    return f"GU-{random_numbers}"


def normalize_text(text):
    """
    Normalize text by converting to lowercase and removing punctuation.
    
    Args:
        text (str): Text to normalize
    
    Returns:
        str: Normalized text
    """
    # Convert to lowercase
    text = text.lower()
    # Remove punctuation
    text = re.sub(r'[^\w\s]', '', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text


def calculate_similarity(text1, text2):
    """
    Calculate similarity score between two texts using rapidfuzz.
    
    Args:
        text1 (str): First text
        text2 (str): Second text
    
    Returns:
        int: Similarity score (0-100)
    """
    # Use token_set_ratio for better comparison handling word order differences
    similarity = fuzz.token_set_ratio(text1, text2)
    return similarity


def generate_device_hash(request):
    """
    Generate a device hash from IP address and user agent.
    
    Args:
        request: FastAPI request object
    
    Returns:
        str: SHA256 hash of IP + user agent
    """
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Get user agent
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Combine and hash
    combined = f"{client_ip}:{user_agent}"
    device_hash = hashlib.sha256(combined.encode()).hexdigest()
    
    return device_hash