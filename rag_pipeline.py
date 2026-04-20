# Minimal wrapper to expose the project's RAG entrypoint for evaluation scripts.
# This imports ask_rag from main.py and re-exports it as a module-level symbol
# so evaluateRAG.py can do: from rag_pipeline import ask_rag

from main import ask_rag

__all__ = ["ask_rag"]
