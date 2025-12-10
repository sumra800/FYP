
# import os
# import requests
# from dotenv import load_dotenv
# load_dotenv()
# api_key = os.getenv("OPENROUTER_API_KEY")
# print("FOUND:", bool(api_key))
# if api_key:
#     print("prefix:", api_key[:6], "len:", len(api_key))
# # Test the API
# headers = {
#     "Authorization": f"Bearer {api_key}",
#     "Content-Type": "application/json"
# }

# payload = {
#     "model": "deepseek/deepseek-chat",
#     "messages": [{"role": "user", "content": "Hello"}]
# }

# response = requests.post(
#     "https://openrouter.ai/api/v1/chat/completions",
#     headers=headers,
#     json=payload
# )

# print(f"Status Code: {response.status_code}")
# print(f"Response: {response.text}")



#=================================================

# import requests
# from dotenv import load_dotenv
# import os

# dotenv_path = os.path.abspath(os.path.join("env", ".env"))
# print("Loading from:", dotenv_path)
# load_dotenv(dotenv_path=dotenv_path)

# import dotenv
# print("dotenv path exists:", os.path.exists(dotenv_path))

# api_key = os.getenv("OPENROUTER_API_KEY")
# print("Loaded key:", bool(api_key), api_key[:6] if api_key else None)

# headers = {
#     "Authorization": f"Bearer {api_key}",
#     "Content-Type": "application/json",
#     "HTTP-Referer": "http://localhost",
#     "X-Title": "DeepSeekRAG Test"
# }

# payload = {
#     "model": "deepseek/deepseek-chat",
#     "messages": [{"role": "user", "content": "Hello from DeepSeek via OpenRouter!"}]
# }

# response = requests.post("https://openrouter.ai/api/v1/chat/completions",
#                          headers=headers, json=payload)

# print("Status Code:", response.status_code)
# print("Response:", response.text)



import os
import requests
from dotenv import load_dotenv

# Load .env file
dotenv_path = os.path.abspath(os.path.join("env", ".env"))
load_dotenv(dotenv_path=dotenv_path, override=True)

api_key = os.getenv("OPENROUTER_API_KEY")
print("Loaded key:", bool(api_key), api_key[:8] if api_key else None)

# Request headers required by OpenRouter
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost",  # required
    "X-Title": "DeepSeekRAG Test"
}

# Chat payload
payload = {
    "model": "deepseek/deepseek-chat",
    "messages": [{"role": "user", "content": "Hello from DeepSeek via OpenRouter!"}]
}

# POST request to OpenRouter
response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers=headers,
    json=payload
)

print("Status Code:", response.status_code)
print("Response:", response.text)
