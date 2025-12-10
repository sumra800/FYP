import requests
import json
import chromadb
import os
import PyPDF2
import re
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List
from dotenv import load_dotenv
import numpy as np
from tqdm import tqdm
import sys
try:
    import select
except Exception:
    select = None

try:
    import msvcrt
except Exception:
    msvcrt = None

import shutil

# ===============================
# LOAD ENVIRONMENT
# ===============================

dotenv_path = os.path.abspath(os.path.join("env", ".env"))
load_dotenv(dotenv_path=dotenv_path, override=True)

# OpenRouter API
openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
model_id = "deepseek/deepseek-chat-v3.1"

# ===============================
# INITIALIZE CHROMA DB
# ===============================

client = chromadb.PersistentClient(path="./course_rag_db")

collection = client.get_or_create_collection(
    name="multi_course_knowledge_base",
    metadata={"hnsw:space": "cosine"}
)

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# ===============================
# PDF LOADING + CHUNKING
# ===============================

def extract_text_from_pdf(pdf_path: str, course_name: str, max_pages: int = None) -> List[dict]:
    text_chunks = []
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        if max_pages:
            total_pages = min(total_pages, max_pages)
        
        print(f"Extracting from {course_name}: {total_pages} pages")
        
        for page_num in tqdm(range(total_pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text() or ""
            
            paragraphs = re.split(r'\n\s*\n', text)
            for para in paragraphs:
                clean_para = re.sub(r'\s+', ' ', para).strip()
                if len(clean_para) > 100:
                    text_chunks.append({
                        "text": clean_para,
                        "course": course_name,
                        "page": page_num + 1,
                        "chunk_id": f"{course_name}_p{page_num+1}_{len(text_chunks)}"
                    })
    
    return text_chunks


def load_documents_into_db(pdf_path: str, course_name: str, max_pages: int = None):
    text_chunks = extract_text_from_pdf(pdf_path, course_name, max_pages)
    
    print(f"Extracted {len(text_chunks)} chunks from {course_name}")
    print("Storing in DB...")
    
    documents, metadatas, ids = [], [], []
    for chunk in text_chunks:
        documents.append(chunk["text"])
        metadatas.append({"course": chunk["course"], "source": pdf_path})
        ids.append(chunk["chunk_id"])
    
    embeddings = []
    batch_size = 32
    for i in tqdm(range(0, len(documents), batch_size)):
        batch_docs = documents[i:i+batch_size]
        batch_embeddings = embedding_model.encode(batch_docs).tolist()
        embeddings.extend(batch_embeddings)
    
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids,
        embeddings=embeddings
    )
    
    print(f"Loaded {len(documents)} chunks from {course_name}")

# ===============================
# RAG QUESTION ANSWERING
# ===============================

def ask_course_question(question: str, course_filter: str = None, max_context_chunks=30):
    question_embedding = embedding_model.encode(question).tolist()
    
    where_filter = {"course": course_filter} if course_filter else None
    
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=max_context_chunks,
        where=where_filter,
        include=["documents", "metadatas"]
    )
    
    context_parts = []
    for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
        context_parts.append(f"[{metadata['course']}] {doc}")

    # 🔧 Deduplicate near-identical text
    unique_contexts = list(dict.fromkeys(context_parts))
    context = "\n\n".join(unique_contexts)

    rag_prompt = f"""
You are an expert teaching assistant.
Base your answer ONLY on the following textbook/course excerpts.
If the question cannot be answered from these excerpts, clearly say so.
Avoid repeating identical sentences — summarize concisely.

Excerpts:
{context}

Student's question: {question}

Answer:
    """.strip()
    
    headers = {
        "Authorization": f"Bearer {openrouter_api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": rag_prompt}],
        "temperature": 0.2,   # Slightly higher for smoother answers
        "max_tokens": 800
    }
    
    try:
        response = requests.post(openrouter_url, headers=headers, data=json.dumps(payload), timeout=60)
        response.raise_for_status()
        data = response.json()
        answer = data['choices'][0]['message']['content']
        source_courses = list(set([m['course'] for m in results['metadatas'][0]]))
        return answer, source_courses
    except Exception as e:
        return f"Error querying API: {str(e)}", []

# ===============================
# SUMMARIZATION (updated to use send_prompt_to_api)
# ===============================

def summarize_text(text: str):
    # Trim very long input to reasonable length to avoid model preamble/echo
    trimmed = text.strip()
    if len(trimmed) > 4000:
        trimmed = trimmed[:4000] + "\n\n[Truncated additional content]"

    prompt = f"""
Summarize the following content clearly and concisely in 2 short sentences. Do NOT repeat the original text or restate the question. Output only the summary.

Content:
{trimmed}

Summary:
""".strip()

    answer, err = send_prompt_to_api(prompt, max_tokens=200)
    if err:
        return f"Error: {err}"
    return answer


# ===============================
# STUDY TIPS GENERATOR (updated to use send_prompt_to_api)
# ===============================

def generate_study_tips(topic: str):
    trimmed = topic.strip()
    if len(trimmed) > 3000:
        trimmed = trimmed[:3000] + "\n\n[Truncated additional content]"

    prompt = f"""
You are an expert study coach. For the text below, provide:
1) A 1-2 sentence summary (do NOT repeat the text)
2) Five practical, numbered study tips or activities (short)
3) One suggested exercise or question to test understanding

Text:
{trimmed}

Respond only with the requested items, avoid repeating the original text.
""".strip()

    answer, err = send_prompt_to_api(prompt, max_tokens=350)
    if err:
        return f"Error: {err}"
    return answer

# ===============================
# INTENT DETECTOR
# ===============================

def detect_intent(user_input: str):
    text = user_input.lower()

    if len(user_input.split()) > 80:
        return "summarize"

    summarize_keywords = ["summarize", "summary", "explain this", "make it short"]
    if any(k in text for k in summarize_keywords):
        return "summarize"

    study_keywords = ["study tips", "how to study", "prepare", "guide me", "study guide"]
    if any(k in text for k in study_keywords):
        return "study_tips"

    return "rag"

def semantic_dedupe(chunks, model, threshold=0.88, max_keep=8):
    """Keep at most `max_keep` chunks that are not semantically too similar.
    Uses the provided embedding `model` to compute embeddings and filters out
    chunks whose cosine similarity to already-kept chunks exceeds `threshold`.
    """
    import numpy as _np
    if not chunks:
        return []
    # Compute embeddings for chunks
    emb = _np.array(model.encode(chunks))
    kept = []
    kept_embs = []
    for i, e in enumerate(emb):
        if len(kept_embs) == 0:
            kept.append(chunks[i])
            kept_embs.append(e)
            continue
        # compute cosine similarity vs kept embeddings
        kept_matrix = _np.vstack(kept_embs)
        sims = (kept_matrix @ e) / (_np.linalg.norm(kept_matrix, axis=1) * (_np.linalg.norm(e) + 1e-10))
        if _np.max(sims) < threshold:
            kept.append(chunks[i])
            kept_embs.append(e)
        if len(kept) >= max_keep:
            break
    return kept


def send_prompt_to_api(prompt: str, max_tokens: int = 800):
    """Send a prompt to the configured LLM (OpenRouter) and return (answer, error).
    Uses a strict system message to prevent repetition/verbosity.
    """
    headers = {
        "Authorization": f"Bearer {openrouter_api_key}",
        "Content-Type": "application/json"
    }

    messages = [
        {"role": "system", "content": "You are a concise, factual teaching assistant. Do NOT repeat the provided excerpts or the user's question. Provide only the requested output in the format asked, and avoid unnecessary preamble or repetition."},
        {"role": "user", "content": prompt}
    ]

    payload = {
        "model": model_id,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": max_tokens
    }
    try:
        resp = requests.post(openrouter_url, headers=headers, data=json.dumps(payload), timeout=60)
        resp.raise_for_status()
        data = resp.json()
        return data['choices'][0]['message']['content'], None
    except Exception as e:
        try:
            detail = resp.text
        except Exception:
            detail = None
        err_msg = f"{str(e)}" + (f" | response: {detail}" if detail else "")
        return None, err_msg

# ===============================
# UNIFIED RAG WRAPPER
# ===============================

def ask_rag(user_input: str):
    """
    Unified wrapper for your RAG system.
    Detects intent, chooses summarization, study tips, or course-based RAG QA.
    Returns a dictionary with mode, answer, and source courses (if any).
    """
    intent = detect_intent(user_input)
    result = {"mode": intent, "answer": "", "sources": []}

    if intent == "summarize":
        result["answer"] = summarize_text(user_input)
    elif intent == "study_tips":
        result["answer"] = generate_study_tips(user_input)
    else:  # RAG mode
        course_filter = None
        q = user_input.strip()
        # Detect course prefixes
        course_prefixes = {"am": "AM", "is": "IS", "pt": "PT", "or": "OR"}
        for prefix, course in course_prefixes.items():
            if q.lower().startswith(prefix + " "):
                course_filter = course
                q = q[len(prefix)+1:].strip()
                break

        answer, sources = ask_course_question(q, course_filter)
        result["answer"] = answer
        result["sources"] = sources

    return result


# ===============================
# MAIN LOOP
# ===============================

if __name__ == "__main__":
    textbooks = {
        "IS": "courses/IS_textbook.pdf",
        "AM": "courses/Introduction_to_Theory_and_Formal_Languages.pdf",
        "PT": "courses/Professional Issues in Software Engineering.pdf",
        # "OR": "courses/Operations-Research.pdf"
    }

    if collection.count() == 0:
        for course_name, path in textbooks.items():
            load_documents_into_db(path, course_name, max_pages=500)

    print("\nMulti-Course RAG System Ready!")

    def normalize_pasted_lines(lines: list) -> str:
        """Normalize pasted multiline input:
        - If a line ends with '-' assume hyphenation and join without space.
        - If a line is empty, preserve paragraph break (\n\n).
        - Otherwise join lines with a single space to avoid word concatenation like 'APIsare'.
        """
        out_parts = []
        i = 0
        while i < len(lines):
            line = lines[i].rstrip('\r')
            if line.strip() == "":
                # paragraph break
                out_parts.append("\n\n")
                i += 1
                continue
            # gather a run of non-empty lines
            run = [line]
            i += 1
            while i < len(lines) and lines[i].strip() != "":
                run.append(lines[i].rstrip('\r'))
                i += 1
            # join run with handling hyphenation
            joined = ""
            for part in run:
                if joined == "":
                    joined = part
                else:
                    if joined.endswith('-'):
                        # remove hyphen and join directly
                        joined = joined[:-1] + part.lstrip()
                    else:
                        # ensure a single space between parts
                        joined = joined + ' ' + part.lstrip()
            out_parts.append(joined)
        # combine parts and normalize multiple paragraph markers
        text = ''.join(out_parts)
        # replace multiple paragraph markers with two newlines
        text = re.sub(r'(\n\n)+', '\n\n', text)
        return text.strip()

    def read_multiline_input(instruction: str) -> str:
        print(instruction)
        print("End input with a single dot (.) on its own line.")
        lines = []
        while True:
            try:
                line = input()
            except EOFError:
                break
            if line.strip() == ".":
                break
            lines.append(line)
        return normalize_pasted_lines(lines)

    import textwrap
    def print_wrapped(text: str, width: int = None):
        """Print text wrapped at word boundaries and preserve paragraphs.
        Use the current terminal width by default and never break words across lines.
        If a single word is longer than the terminal width it will be placed on its own line (may exceed width).
        """
        if text is None:
            return
        # determine width from terminal if not provided
        try:
            if width is None:
                term_w = shutil.get_terminal_size((80, 20)).columns
                width = max(40, term_w - 2)
        except Exception:
            width = width or 80

        wrapper = textwrap.TextWrapper(
            width=width,
            replace_whitespace=False,
            drop_whitespace=True,
            break_long_words=False,
            break_on_hyphens=False
        )

        # split paragraphs
        paras = text.split('\n\n')
        for p in paras:
            p = p.strip()
            if not p:
                print()
                continue
            # Ensure we don't pre-remove spaces inside paragraph; wrapper handles wrapping
            wrapped = wrapper.fill(p)
            print(wrapped)
            print()

    while True:
        q = input("\nYour question (type 'help' for commands): ")
        # If user pasted multiple lines, there may be extra data waiting on stdin.
        # Try to read remaining buffered lines and combine them.
        extra_lines = []
        try:
            if select:
                # non-blocking check for more data on stdin
                # small timeout to allow paste buffering
                while select.select([sys.stdin], [], [], 0.01)[0]:
                    line = sys.stdin.readline()
                    if not line:
                        break
                    extra_lines.append(line.rstrip('\n'))
            elif msvcrt:
                # Windows fallback: read while kbhit is true
                while msvcrt.kbhit():
                    ch = msvcrt.getwche()
                    # read rest of line
                    rest = sys.stdin.readline()
                    extra_lines.append(ch + rest.rstrip('\n'))
        except Exception:
            extra_lines = []

        if extra_lines:
            combined = [q] + extra_lines
            q = normalize_pasted_lines(combined)
        else:
            q = q.strip()

        if q.lower() in ["quit", "exit", "q"]:
            break

        if q.lower() == 'help':
            print("Commands:\n - summarize: <text>  — summarize given text and give a short study plan\n - summarize: (no text) — paste text, end with a single '.' line\n - study: <text>      — give study tips\n - study: (no text)   — paste text, end with a single '.' line\n - <course prefix> question — e.g. 'am What is ...' to filter to a course\n - or just ask a question to search across all courses")
            continue

        # Handle summarize command
        if q.lower().startswith('summarize'):
            # Check if inline text provided after colon
            parts = q.split(':', 1)
            if len(parts) == 2 and parts[1].strip():
                content = parts[1].strip()
            else:
                content = read_multiline_input("Paste the text to summarize:")
                if not content:
                    print("No text provided. Cancelling summarization.")
                    continue
            print("\n" + "="*60)
            print("SUMMARY:\n")
            print_wrapped(summarize_text(content))
            print("="*60)
            continue

        # Handle study tips command
        if q.lower().startswith('study') or q.lower().startswith('study:') or 'study tips' in q.lower():
            parts = q.split(':', 1)
            if len(parts) == 2 and parts[1].strip():
                content = parts[1].strip()
            else:
                content = read_multiline_input("Paste the text/topic to get study tips for:")
                if not content:
                    print("No text provided. Cancelling study tips.")
                    continue
            print("\n" + "="*60)
            print("STUDY TIPS:\n")
            print_wrapped(generate_study_tips(content))
            print("="*60)
            continue

        # Course filter detection for RAG queries
        course_filter = None
        user_q = q
        course_prefixes = {"am": "AM", "is": "IS", "pt": "PT", "or": "OR"}
        for prefix, course in course_prefixes.items():
            if user_q.lower().startswith(prefix + " "):
                course_filter = course
                user_q = user_q[len(prefix)+1:].strip()
                break

        answer, sources = ask_course_question(user_q, course_filter)
        print("\n" + "="*60)
        print("ANSWER:\n")
        print_wrapped(answer)
        if sources:
            print("Sources:")
            print_wrapped(', '.join(map(str, sources)))
        print("="*60)
