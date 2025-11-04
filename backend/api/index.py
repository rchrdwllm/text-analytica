from http import HTTPStatus
import pandas as pd
import os
from gensim.models import LdaModel
from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import cache
import kagglehub
import networkx as nx
import pickle

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://text-analytica.vercel.app"])

# Global object
dataset_df: pd.DataFrame = None
all_authors: nx.MultiGraph = None
all_topics: dict[str, tuple[LdaModel, int]] = {}

def parse_date(string: str):
    match list(map(int, string.split("/"))):
        case [month, day, year] if year >= 50:
            return (month, day, 1900 + year)
        case [month, day, year] if year <= 50:
            return (month, day, 2000 + year)
        case v:
            print(f"Unknown format: {v}")
            return None

def load_dataset():
    global dataset_df
    try:
        if dataset_df is not None:
            return

        if os.path.exists('dataset.pkl'):
            with open('dataset.pkl', 'rb') as f:
                dataset_df = pickle.load(f)
                return
        raise Exception()
    except:
        # Download the dataset
        dataset_path = kagglehub.dataset_download("sumitm004/arxiv-scientific-research-papers-dataset")

        # Assuming the downloaded file is a CSV and finding the filename
        # List files in the downloaded directory
        files = os.listdir(dataset_path)
        csv_file = None
        for file in files:
            if file.endswith('.csv'):
                csv_file = file
                break

        if not csv_file: raise "No CSV file found in the downloaded dataset."

        file_path = os.path.join(dataset_path, csv_file)
        # Read the dataset into a pandas DataFrame
        dataset_df = pd.read_csv(file_path)

def load_author_graph():
    global all_authors
    try:
        if os.path.exists('graph.pkl'):
            with open('graph.pkl', 'rb') as f:
                all_authors = pickle.load(f)
                return
        raise Exception()
    except:
        # Initialize an empty graph
        G = nx.Graph()

        # Iterate through each row of the DataFrame
        for index, row in dataset_df.iterrows():
            print(f"{index}/{len(dataset_df)}")
            authors = eval(row['authors'])

            # Add nodes for each author
            for author in authors:
                G.add_node(author)

            # If a paper has more than one author, add edges between unique pairs
            if len(authors) > 1:
                for i in range(len(authors)):
                    for j in range(i + 1, len(authors)):
                        author1 = authors[i]
                        author2 = authors[j]
                        # Add edge and update weight
                        if G.has_edge(author1, author2):
                            G[author1][author2]['weight'] += 1
                        else:
                            G.add_edge(author1, author2, weight=1)

        all_authors = G
        model_path = f'graph.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(all_authors, f)

def load_topics():
    global all_topics
    try:
        if os.path.exists('topics.pkl'):
            with open('topics.pkl', 'rb') as f:
                all_topics = pickle.load(f)
                return
        raise Exception()
    except:
        ...

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
    total_topics = sum(num_topics for num_topics, _ in all_topics.values())
    overview = {
        "total_documents": total_documents,
        "total_authors": all_authors.number_of_nodes(),
        "total_topics": total_topics,
        "total_connections": all_authors.number_of_edges()
    }
    return jsonify(overview)

@app.route("/api/corpus-documents")
@cache
def corpus_documents():
    """
    Returns the corpus documents.
    """
    topics = []
    for _, row in dataset_df.iterrows():
        topics.append({"title": row['title'],
                       "authors": eval(row['authors']),
                       "publicationYear": parse_date(row['published_date'])[2]})

    return jsonify(topics), 200

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
    print("Starting the Flask application!")
    print("Loading dataset...")
    load_dataset()
    print("Loading author graph...")
    load_author_graph()

    print("Starting flask host.")
    app.run(host='0.0.0.0', port=5000, debug=True)
