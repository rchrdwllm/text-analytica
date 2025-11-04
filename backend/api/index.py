from http import HTTPStatus
import pandas as pd
import io
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://text-analytica.vercel.app"])

# Global object
all_topics: dict[str, tuple[int, pd.DataFrame]] = {}

@app.route("/api/health")
def health():
    """
    Checks the health of the API.
    """
    return jsonify({ "status": "ok" })

@app.route("/api/corpus-overview")
def corpus_overview():
    """
    Returns the corpus overview.
    """
    total_documents = sum(len(df) for _, df in all_topics.values())
    all_authors = set()
    for _, df in all_topics.values():
        if "author" in df.columns:
            all_authors.update(df["author"].unique())
    total_authors = len(all_authors)
    total_topics = sum(num_topics for num_topics, _ in all_topics.values())
    overview = {
        "total_documents": total_documents,
        "total_authors": total_authors,
        "total_topics": total_topics
    }
    return jsonify(overview)

@app.route("/api/corpus-documents")
def corpus_documents():
    """
    Returns the corpus documents.
    """
    if not all_topics:
        return jsonify([])

    combined_df = pd.concat([df for _, df in all_topics.values()], ignore_index=True)
    return jsonify(combined_df.to_dict(orient="records"))

@app.route("/api/topic-count-per-year")
def topic_count_per_year():
    """
    Returns the topic count per year.
    """
    result = []
    for group_name, (num_topics, df) in all_topics.items():
        result.append({
            "year": group_name,
            "topic_count": num_topics
        })
    return jsonify(result)

@app.route("/api/trending-topics-per-year")
def trending_topics_per_year():
    """
    Returns the trending topics per year.
    """
    result = []
    for group_name, (num_topics, df) in all_topics.items():
        # Placeholder: This will need actual topic analysis logic
        result.append({
            "year": group_name,
            "topics": []  # This should contain actual trending topics
        })
    return jsonify(result)

@app.route("/api/corpus-topics")
def corpus_topics():
    """
    Returns the corpus topics.
    """
    result = []
    for group_name, (num_topics, df) in all_topics.items():
        result.append({
            "group": group_name,
            "num_topics": num_topics,
            "document_count": len(df)
        })
    return jsonify(result)

@app.route("/api/author-networks", methods=["POST"])
def author_networks():
    """
    Returns the author networks.
    """
    data = request.get_json()
    author_name = data.get("author_name", "")
    
    nodes = []
    links = []
    
    # Search through all_topics for the author and build the network
    for group_name, (num_topics, df) in all_topics.items():
        if "author" in df.columns and "title" in df.columns:
            # Find documents by the author
            author_docs = df[df["author"].str.contains(author_name, case=False, na=False)]
            
            for _, doc in author_docs.iterrows():
                # Add document node
                doc_id = doc.get("title", "Unknown")
                if {"id": doc_id, "group": "paper"} not in nodes:
                    nodes.append({"id": doc_id, "group": "paper"})
                
                # Add link from author to document
                if {"source": author_name, "target": doc_id} not in links:
                    links.append({"source": author_name, "target": doc_id})
    
    # Add the author node
    if nodes:
        nodes.insert(0, {"id": author_name, "group": "author"})
    
    response = {
        "nodes": nodes,
        "links": links
    }
    return jsonify(response)

@app.route("/api/paper-analysis", methods=["POST"])
def paper_analysis():
    """
    Returns the paper analysis.
    """
    if 'file' not in request.files:
        return "No file part", HTTPStatus.BAD_REQUEST
    file = request.files['file']
    if file.filename == '':
        return "No selected file", HTTPStatus.BAD_REQUEST
    if file:
        # Read the uploaded file
        content = file.read().decode('utf-8')

        # Placeholder for paper analysis logic
        # This should include:
        # 1. Preprocessing the uploaded document
        # 2. Finding topic similarities from all_topics
        # 3. Finding similar documents from all_topics

        analysis = {
            "preprocessing_outputs": f"Processed document: {file.filename}",
            "topic_similarity": [],
            "similar_documents": []
        }

        # Search through all_topics for similar documents (placeholder logic)
        for group_name, (num_topics, df) in all_topics.items():
            if "title" in df.columns:
                # This is a placeholder - actual similarity calculation would go here
                for _, doc in df.head(2).iterrows():  # Just get first 2 as example
                    analysis["similar_documents"].append({
                        "title": doc.get("title", "Unknown"),
                        "authors": doc.get("author", "Unknown"),
                        "year": group_name
                    })

        return jsonify(analysis)
    return "Error processing file", HTTPStatus.INTERNAL_SERVER_ERROR

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
