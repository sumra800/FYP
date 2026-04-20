Create and activate venv (bash):
python -m venv .venv
source .venv/Scripts/activate
Install deps:
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
Add secrets:
copy .env.example -> .env and fill OPENROUTER_API_KEY
(If no DB provided) Put PDFs into courses or update paths in main.py
Run:
python main.py