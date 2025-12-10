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


# Load .env file
dotenv_path = os.path.abspath(os.path.join("env", ".env"))
load_dotenv(dotenv_path=dotenv_path, override=True)


# OpenRouter API
openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
model_id = "deepseek/deepseek-chat-v3.1"

# Initialize Chroma client
client = chromadb.PersistentClient(path="./course_rag_db")

# One collection for all courses
collection = client.get_or_create_collection(
    name="multi_course_knowledge_base",
    metadata={"hnsw:space": "cosine"}
)

# Embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(pdf_path: str, course_name: str, max_pages: int = None) -> List[dict]:
    """
    Extract text from a PDF textbook and split into chunks with course info
    """
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
    """
    Load one course/book into DB
    """
    text_chunks = extract_text_from_pdf(pdf_path, course_name, max_pages)
    
    print(f"Extracted {len(text_chunks)} chunks from {course_name}")
    print("Storing in DB...")
    
    documents, metadatas, ids = [], [], []
    for chunk in text_chunks:
        documents.append(chunk["text"])
        metadatas.append({"course": chunk["course"], "source": pdf_path})
        ids.append(chunk["chunk_id"])
    
    # Generate embeddings in batches
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

def ask_course_question(question: str, course_filter: str = None, max_context_chunks=50):
    """
    Ask a question across multiple courses, with optional course filtering
    """
    question_embedding = embedding_model.encode(question).tolist()
    
    where_filter = {"course": course_filter} if course_filter else None
    
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=max_context_chunks,
        where=where_filter,
        include=["documents", "metadatas"]
    )
    
    # Build context (remove page numbers, only keep course if desired)
    context_parts = []
    for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
        context_parts.append(f"[{metadata['course']}] {doc}")
    
    context = "\n\n".join(context_parts)
    
    rag_prompt = f"""You are an expert teaching assistant. 
Base your answer ONLY on the following textbook/course excerpts. 
If the question cannot be answered from these excerpts, say so clearly.

Excerpts:
{context}

Student's question: {question}

Answer:"""
    
    headers = {
        "Authorization": f"Bearer {openrouter_api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": rag_prompt}],
        "temperature": 0.1,
        "max_tokens": 800
    }
    
    try:
        response = requests.post(openrouter_url, headers=headers, data=json.dumps(payload), timeout=30)
        response.raise_for_status()
        data = response.json()
        answer = data['choices'][0]['message']['content']
        source_courses = list(set([m['course'] for m in results['metadatas'][0]]))
        return answer, source_courses
    except Exception as e:
        return f"Error querying API: {str(e)}", []

# Example usage
if __name__ == "__main__":
    textbooks = {
        "IS": "courses/IS_textbook.pdf",
        "AM": "courses/Introduction_to_Theory_and_Formal_Languages.pdf", 
        "PT": "courses/Professional Issues in Software Engineering.pdf",
        #"OR": "courses/Operations-Research-An-Introduction-10th-Ed.-Hamdy-A-Taha.pdf"
    }
    
    # Load only if empty
    if collection.count() == 0:
        for course_name, path in textbooks.items():
            load_documents_into_db(path, course_name, max_pages=500)
    
    print("\nMulti-Course RAG System Ready!")
    while True:
        q = input("\nYour question: ").strip()
        if q.lower() in ["quit", "exit", "q"]:
            break
        
        # Detect course if user specifies (e.g., "In ML course, explain gradient descent")
        course_filter = None
        if q.lower().startswith("am "):
            course_filter = "AM"
            q = q[3:].strip()
        elif q.lower().startswith("is "):
            course_filter = "IS"
            q = q[3:].strip()
        elif q.lower().startswith("pt "):
            course_filter = "PT"
            q = q[3:].strip()
        elif q.lower().startswith("or "):
            course_filter = "OR"
            q = q[3:].strip()
        
        answer, sources = ask_course_question(q, course_filter)
        print("\n" + "="*60)
        print(f"ANSWER:\n{answer}")
        # print(f"\nSources: {sources}")
        print("="*60)
