import csv
from rag_pipeline import ask_rag   # this should call your RAG chatbot

def evaluate_rag(csv_file):
    total = 0
    correct = 0

    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            course = row["course"]
            topic = row["topic"]
            question = row["question"]
            expected = row["expected_answer"]

            # call your RAG chatbot
            answer = ask_rag(question)

            print("\n======================================")
            print("Course:", course)
            print("Topic:", topic)
            print("Q:", question)
            print("Expected:", expected)
            print("Model Answer:", answer)

            # simple accuracy: keyword matching
            if expected.lower()[:40] in answer.lower():
                correct += 1

            total += 1

    print("\n===== FINAL ACCURACY =====")
    print(f"Accuracy: {(correct/total)*100:.2f}%")

# Run
evaluate_rag("evaluation.csv")
