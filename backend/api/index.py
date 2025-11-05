from http import HTTPStatus
import io
from pathlib import Path
from typing import Any
import pandas as pd
import os
from gensim.models import LdaMulticore
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from functools import cache
import kagglehub
import networkx as nx
import pickle
import nltk
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import ast
import json
from wordcloud import WordCloud
import matplotlib

matplotlib.use("Agg")  # Use non-interactive backend
import matplotlib.pyplot as plt

import re

app = Flask(__name__)
CORS(app)

# Global object
dataset_df: pd.DataFrame = None
all_authors: nx.MultiGraph = None
all_topics: dict[str, tuple[LdaMulticore, int, pd.DataFrame]] = {}


def save_pickle(path: str, object: Any):
    path_obj = Path("pickles") / path
    if not path_obj.parent.exists():
        os.makedirs(path_obj.parent)

    with open(path_obj, "wb") as f:
        pickle.dump(object, f)


def load_pickle(path: str) -> Any | None:
    path_obj = Path("pickles") / path
    if path_obj.exists():
        with open(path_obj, "rb") as f:
            return pickle.load(f)
    return None


def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    # Remove non-alphanumeric characters and tokenize
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = nltk.word_tokenize(text)
    # Remove stop words
    stop_words = set(stopwords.words("english"))
    tokens = [word for word in tokens if word not in stop_words]
    # Lemmatization
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return tokens


def parse_date(string: str):
    match list(map(int, string.split("/"))):
        case [month, day, year] if year >= 50:
            return (month, day, 1900 + year)
        case [month, day, year] if year <= 50:
            return (month, day, 2000 + year)
        case v:
            print(f"Unknown format: {v}")
            return None


def parse_authors_field(value):
    """Safely parse the authors field which may be stored as:
    - a Python-style list string (e.g. "['A','B']")
    - a JSON array string
    - an actual Python list
    - a comma-separated string
    Returns a list of author strings (or empty list on failure).
    """
    if value is None:
        return []
    # Already a list
    if isinstance(value, list):
        return value
    # Not a string -> wrap
    if not isinstance(value, str):
        return [value]

    s = value.strip()
    # Try ast.literal_eval first (safe for Python literals)
    try:
        parsed = ast.literal_eval(s)
        if isinstance(parsed, list):
            return parsed
        # If it's a single string, return as single-element list
        if isinstance(parsed, str):
            return [parsed]
    except Exception:
        pass

    # Try JSON
    try:
        parsed = json.loads(s)
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, str):
            return [parsed]
    except Exception:
        pass

    # Fallback: split by comma
    parts = [p.strip() for p in s.split(",") if p.strip()]
    return parts


def load_dataset():
    global dataset_df
    try:
        if dataset_df is not None:
            return

        if os.path.exists("dataset.pkl"):
            with open("dataset.pkl", "rb") as f:
                dataset_df = pickle.load(f)
                return
        raise Exception()
    except:
        # Download the dataset
        dataset_path = kagglehub.dataset_download(
            "sumitm004/arxiv-scientific-research-papers-dataset"
        )

        # Assuming the downloaded file is a CSV and finding the filename
        # List files in the downloaded directory
        files = os.listdir(dataset_path)
        csv_file = None
        for file in files:
            if file.endswith(".csv"):
                csv_file = file
                break

        if not csv_file:
            raise "No CSV file found in the downloaded dataset."

        file_path = os.path.join(dataset_path, csv_file)
        # Read the dataset into a pandas DataFrame
        dataset_df = pd.read_csv(file_path)


def load_author_graph():
    global all_authors

    if (all_authors := load_pickle("graph.pkl")) is None:
        # Initialize an empty graph
        G = nx.Graph()

        # Iterate through each row of the DataFrame
        for _, row in dataset_df.iterrows():
            authors = parse_authors_field(row.get("authors"))

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
                            G[author1][author2]["weight"] += 1
                        else:
                            G.add_edge(author1, author2, weight=1)

        all_authors = G
        save_pickle("graph.pkl", all_authors)

    return all_authors


def load_topics():
    global all_topics
    all_topics = load_pickle("all_lda_models.pkl")


@app.route("/api/health")
def health():
    """
    Checks the health of the API.
    """
    return jsonify({"status": "ok"})


@app.route("/api/corpus-overview")
def corpus_overview():
    """
    Returns the corpus overview.
    """
    total_documents = sum(len(df) for _, _, df in all_topics.values())
    total_topics = sum(num_topics for _, num_topics, _ in all_topics.values())
    overview = {
        "total_documents": total_documents,
        "total_authors": all_authors.number_of_nodes(),
        "total_topics": total_topics,
        "total_connections": all_authors.number_of_edges(),
    }
    return jsonify(overview)


@app.route("/api/corpus-documents")
@cache
def corpus_documents():
    """
    Returns the corpus documents with their topics.
    """

    print("Loading api/corpus-documents")
    if (to_return := load_pickle("corpus_documents.pkl")) is None:
        to_return = []

        # Iterate through all topics to get documents with their dominant topics
        for group_name, (model, num_topics, df) in all_topics.items():
            for _, row in df.iterrows():
                # Get dominant topic for this document if processed_summary exists
                topics_str = ""

                if "processed_summary" in df.columns and row.get("processed_summary"):
                    bow = model.id2word.doc2bow(row["processed_summary"])
                    topic_distribution = model.get_document_topics(bow)

                    if topic_distribution:
                        # Get top 3 topics for this document
                        top_topics = sorted(
                            topic_distribution, key=lambda x: x[1], reverse=True
                        )[:3]
                        topic_keywords = []
                        for topic_id, prob in top_topics:
                            # Get top 5 words for this topic
                            words = [
                                word for word, _ in model.show_topic(topic_id, topn=3)
                            ]
                            topic_keywords.append(f"{', '.join(words)} ({prob:.2f})")
                        topics_str = " | ".join(topic_keywords)

                to_return.append(
                    {
                        "title": row["title"],
                        "authors": parse_authors_field(row.get("authors")),
                        "publicationYear": (
                            parse_date(row["published_date"])[2]
                            if "published_date" in row
                            else group_name.split("-")[0]
                        ),
                        "topics": topics_str,
                    }
                )

        save_pickle("corpus_documents.pkl", to_return)

    return jsonify(to_return), 200


@app.route("/api/topic-count-per-group")
def topic_count_per_group():
    """
    Returns the topic count per group.
    """
    result = [
        {"group": group_name, "topic_count": num_topics}
        for group_name, (_, num_topics, _) in all_topics.items()
    ]

    print(result)

    return jsonify(result)


@app.route("/api/trending-topics-per-group")
def trending_topics_per_group():
    """
    Returns the trending topics per year with top keywords.
    Vectorized version for better performance.
    """

    if (result := load_pickle("trending_topics_per_group.pkl")) is None:
        result = []
        for group_name, (model, num_topics, df) in all_topics.items():
            # Get all topics for this year group
            topics_data = []

            # Vectorized computation: process all documents at once
            if "processed_summary" in df.columns:
                # Get dominant topics for all documents at once
                def get_dominant_topic(summary):
                    if not summary:
                        return -1
                    bow = model.id2word.doc2bow(summary)
                    if not bow:
                        return -1
                    doc_topics = model.get_document_topics(bow)
                    if doc_topics:
                        return max(doc_topics, key=lambda x: x[1])[0]
                    return -1

                # Vectorized operation using pandas apply
                valid_summaries = df["processed_summary"].notna()
                dominant_topics = df[valid_summaries]["processed_summary"].apply(
                    get_dominant_topic
                )

                # Count documents per topic using value_counts
                topic_counts = (
                    dominant_topics[dominant_topics >= 0].value_counts().to_dict()
                )
            else:
                topic_counts = {}

            for topic_id in range(num_topics):
                # Get top 10 words for this topic
                top_words = model.show_topic(topic_id, topn=10)
                keywords = [
                    {"word": word, "weight": float(weight)}
                    for word, weight in top_words
                ]

                # Get document count from precomputed counts
                topic_count = topic_counts.get(topic_id, 0)

                topics_data.append(
                    {
                        "topic_id": topic_id,
                        "keywords": keywords,
                        "document_count": topic_count,
                    }
                )

            # Sort by document count to get "trending" topics
            topics_data.sort(key=lambda x: x["document_count"], reverse=True)

            result.append(
                {
                    "group": group_name,
                    "topics": topics_data[:5],  # Return top 5 trending topics
                }
            )
        save_pickle("trending_topics_per_group.pkl", result)

    return jsonify(result)


@app.route("/api/corpus-topics")
def corpus_topics():
    topics_by_group = []

    for group_name, (model, num_topics, df) in all_topics.items():
        topics_by_group.append(
            {"group_name": group_name, "topics": num_topics, "total_documents": len(df)}
        )

    return jsonify(topics_by_group)


@app.route("/api/corpus-topics/<year_group>", methods=["GET"])
def corpus_topics_detail(year_group):
    """
    Returns detailed topics with documents and coherence scores for a specific year group.
    Schema: [{"topic": string, "documents": [{"title": string}], "coherence": number}]
    """

    # Find the model and data for the specified year group
    if year_group not in all_topics:
        return (
            jsonify({"error": f"Year group '{year_group}' not found"}),
            HTTPStatus.NOT_FOUND,
        )

    if (to_return := load_pickle(f"corpus_topics/{year_group}.pkl")) is None:
        model, num_topics, df = all_topics[year_group]
        to_return = []
        # Vectorized computation: process all documents at once to find dominant topics
        if "processed_summary" in df.columns:
            # Get dominant topic and confidence for all documents
            def get_dominant_topic_with_confidence(summary):
                if not summary:
                    return -1, 0.0
                bow = model.id2word.doc2bow(summary)
                if not bow:
                    return -1, 0.0
                doc_topics = model.get_document_topics(bow)
                if doc_topics:
                    # Get the topic with highest probability
                    dominant = max(doc_topics, key=lambda x: x[1])
                    return dominant[0], dominant[1]  # topic_id, confidence
                return -1, 0.0

            valid_summaries = df["processed_summary"].notna()
            df_copy = df[valid_summaries].copy()

            # Apply function to get both topic and confidence
            topic_confidence = df_copy["processed_summary"].apply(
                get_dominant_topic_with_confidence
            )
            df_copy["dominant_topic"] = topic_confidence.apply(lambda x: x[0])
            df_copy["topic_confidence"] = topic_confidence.apply(lambda x: x[1])

            # Group documents by dominant topic
            for topic_id in range(num_topics):
                # Get top words for this topic to create the topic label
                topic_words = model.show_topic(topic_id, topn=3)
                topic_label = ", ".join([word for word, _ in topic_words])

                # Get documents where this is the dominant topic
                topic_docs = df_copy[df_copy["dominant_topic"] == topic_id]

                # Sort by confidence score and limit to top 10 documents
                topic_docs = topic_docs.sort_values("topic_confidence", ascending=False)

                documents = []
                for _, row in topic_docs.head(10).iterrows():
                    documents.append(
                        {
                            "title": row.get("title", "Unknown"),
                            "confidence": float(row["topic_confidence"]),
                        }
                    )

                to_return.append({"topic": topic_label, "documents": documents})
        save_pickle(f"corpus_topics/{year_group}.pkl", to_return)

    return jsonify(to_return)


@app.route("/api/author-networks", methods=["POST"])
def author_networks():
    """
    Returns the author networks showing collaborations.
    """
    data = request.get_json()
    author_name = data.get("author_name", "")

    if not author_name:
        return jsonify({"nodes": [], "links": []}), 200

    nodes = []
    links = []
    added_nodes = set()
    added_links = set()

    # Check if author exists in the graph
    if author_name not in all_authors:
        return jsonify({"nodes": [], "links": [], "message": "Author not found"}), 200

    # Add the main author node
    nodes.append({"id": author_name, "group": "author"})
    added_nodes.add(author_name)

    # Get all neighbors (co-authors) from the graph
    neighbors = list(all_authors.neighbors(author_name))

    # Add co-author nodes and links
    for co_author in neighbors[:50]:  # Limit to top 50 co-authors
        if co_author not in added_nodes:
            # Get the collaboration weight
            weight = all_authors[author_name][co_author]["weight"]
            nodes.append({"id": co_author, "group": "co-author", "weight": weight})
            added_nodes.add(co_author)

        link_key = tuple(sorted([author_name, co_author]))
        if link_key not in added_links:
            weight = all_authors[author_name][co_author]["weight"]
            links.append({"source": author_name, "target": co_author, "value": weight})
            added_links.add(link_key)

    # Add papers by searching through all_topics
    for group_name, (model, num_topics, df) in all_topics.items():
        if "authors" in df.columns and "title" in df.columns:
            for _, doc in df.iterrows():
                authors_list = parse_authors_field(doc.get("authors"))
                if author_name in authors_list:
                    # Add paper node
                    paper_id = doc.get("title", "Unknown")
                    if paper_id not in added_nodes:
                        nodes.append(
                            {"id": paper_id, "group": "paper", "year": group_name}
                        )
                        added_nodes.add(paper_id)

                    # Link author to paper
                    link_key = (author_name, paper_id)
                    if link_key not in added_links:
                        links.append(
                            {"source": author_name, "target": paper_id, "value": 1}
                        )
                        added_links.add(link_key)

                    # Link co-authors to the same paper
                    for co_author in authors_list:
                        if co_author != author_name and co_author in added_nodes:
                            link_key = (co_author, paper_id)
                            if link_key not in added_links:
                                links.append(
                                    {
                                        "source": co_author,
                                        "target": paper_id,
                                        "value": 1,
                                    }
                                )
                                added_links.add(link_key)

    response = {
        "nodes": nodes,
        "links": links,
        "statistics": {
            "total_co_authors": len([n for n in nodes if n["group"] == "co-author"]),
            "total_papers": len([n for n in nodes if n["group"] == "paper"]),
            "total_connections": len(links),
        },
    }
    return jsonify(response)


@app.route("/api/author-networks", methods=["GET"])
def author_networks_get():
    """
    GET endpoint to return either a full (limited) author graph or a subgraph
    for a specific author when ?author_name= is provided.
    """
    author_name = request.args.get("author_name", "")

    # If an author is requested, mirror the POST behavior (return subgraph)
    if author_name:
        nodes = []
        links = []
        added_nodes = set()
        added_links = set()

        if author_name not in all_authors:
            return (
                jsonify({"nodes": [], "links": [], "message": "Author not found"}),
                200,
            )

        # Calculate paper counts for all authors first
        author_paper_counts = {}
        for group_name, (model, num_topics, df) in all_topics.items():
            if "authors" in df.columns:
                for _, doc in df.iterrows():
                    authors_list = parse_authors_field(doc.get("authors"))
                    for author in authors_list:
                        author_paper_counts[author] = (
                            author_paper_counts.get(author, 0) + 1
                        )

        nodes.append(
            {
                "id": author_name,
                "group": "author",
                "paper_count": author_paper_counts.get(author_name, 0),
            }
        )
        added_nodes.add(author_name)

        neighbors = list(all_authors.neighbors(author_name))

        for co_author in neighbors[:50]:
            if co_author not in added_nodes:
                weight = all_authors[author_name][co_author].get("weight", 1)
                nodes.append(
                    {
                        "id": co_author,
                        "group": "co-author",
                        "weight": weight,
                        "paper_count": author_paper_counts.get(co_author, 0),
                    }
                )
                added_nodes.add(co_author)

            link_key = tuple(sorted([author_name, co_author]))
            if link_key not in added_links:
                weight = all_authors[author_name][co_author].get("weight", 1)
                links.append(
                    {"source": author_name, "target": co_author, "value": weight}
                )
                added_links.add(link_key)

        # papers
        for group_name, (model, num_topics, df) in all_topics.items():
            if "authors" in df.columns and "title" in df.columns:
                for _, doc in df.iterrows():
                    authors_list = parse_authors_field(doc.get("authors"))
                    if author_name in authors_list:
                        paper_id = doc.get("title", "Unknown")
                        if paper_id not in added_nodes:
                            nodes.append(
                                {"id": paper_id, "group": "paper", "year": group_name}
                            )
                            added_nodes.add(paper_id)

                        link_key = (author_name, paper_id)
                        if link_key not in added_links:
                            links.append(
                                {"source": author_name, "target": paper_id, "value": 1}
                            )
                            added_links.add(link_key)

                        for co_author in authors_list:
                            if co_author != author_name and co_author in added_nodes:
                                link_key = (co_author, paper_id)
                                if link_key not in added_links:
                                    links.append(
                                        {
                                            "source": co_author,
                                            "target": paper_id,
                                            "value": 1,
                                        }
                                    )
                                    added_links.add(link_key)

        # Calculate statistics
        statistics = {
            "total_co_authors": len([n for n in nodes if n["group"] == "co-author"]),
            "total_papers": len([n for n in nodes if n["group"] == "paper"]),
            "total_connections": len(links),
        }

        response = {"nodes": nodes, "links": links, "statistics": statistics}
        return jsonify(response)

    # Otherwise return a limited full graph summary (cap sizes)
    nodes = []
    links = []
    # compute weighted degree for node sizing
    try:
        weighted_degrees = {
            n: int(all_authors.degree(n, weight="weight") or 0)
            for n in all_authors.nodes()
        }
    except Exception:
        weighted_degrees = {n: 0 for n in all_authors.nodes()}

    # Calculate paper count for each author
    author_paper_counts = {}
    for group_name, (model, num_topics, df) in all_topics.items():
        if "authors" in df.columns:
            for _, doc in df.iterrows():
                authors_list = parse_authors_field(doc.get("authors"))
                for author in authors_list:
                    author_paper_counts[author] = author_paper_counts.get(author, 0) + 1

    # limit nodes to first 1000 and links to first 2000 to keep payload reasonable
    node_list = list(all_authors.nodes())[:1000]
    node_set = set(node_list)  # Create a set for O(1) lookup

    for n in node_list:
        nodes.append(
            {
                "id": n,
                "group": "author",
                "weight": weighted_degrees.get(n, 0),
                "paper_count": author_paper_counts.get(n, 0),
            }
        )

    # Only include edges where BOTH nodes are in our selected node set
    for u, v, data in all_authors.edges(data=True):
        if u in node_set and v in node_set:
            links.append({"source": u, "target": v, "value": data.get("weight", 1)})
            if len(links) >= 2000:  # Still limit total links
                break

    return jsonify(
        {
            "nodes": nodes,
            "links": links,
            "statistics": {"nodes": len(nodes), "links": len(links)},
        }
    )


@app.route("/api/network-statistics")
def network_statistics():
    if (to_return := load_pickle("network_statistics.pkl")) is None:
        nodes = all_authors.number_of_nodes()
        edges = all_authors.number_of_edges()

        # Calculate number of communities using Louvain algorithm
        undirected_graph = all_authors.to_undirected()
        communities_generator = nx.community.louvain_communities(undirected_graph)
        communities = len(list(communities_generator))

        # Calculate average degree
        degrees = [degree for _, degree in all_authors.degree()]
        average_degree = sum(degrees) / len(degrees) if degrees else 0
        to_return = {
            "nodes": nodes,
            "edges": edges,
            "communities": communities,
            "average_degree": average_degree,
        }

        save_pickle("network_statistics.pkl", to_return)

    return jsonify(to_return)


@app.route("/api/paper-analysis", methods=["POST"])
def paper_analysis():
    """
    Analyzes an uploaded paper and finds similar documents and topics.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), HTTPStatus.BAD_REQUEST

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), HTTPStatus.BAD_REQUEST

    try:
        # Read the uploaded file (handle binary PDFs and text with unknown encoding)
        bytes_data = file.read()
        content = ""

        # Prefer treating PDFs with a PDF parser; otherwise try UTF-8 then fall back
        try:
            if bytes_data[:4] == b"%PDF":
                # PDF file — try to extract text using PyPDF2 if available
                from io import BytesIO

                try:
                    from PyPDF2 import PdfReader
                except Exception:
                    PdfReader = None

                if PdfReader is not None:
                    reader = PdfReader(BytesIO(bytes_data))
                    pages = []
                    for p in reader.pages:
                        try:
                            pages.append(p.extract_text() or "")
                        except Exception:
                            pages.append("")
                    content = "\n".join(pages)
                else:
                    # PyPDF2 not installed — fall back to a tolerant text decode
                    content = bytes_data.decode("latin-1", errors="replace")
            else:
                # Try decode as UTF-8, then fallback to latin-1 with replacement
                try:
                    content = bytes_data.decode("utf-8")
                except UnicodeDecodeError:
                    content = bytes_data.decode("latin-1", errors="replace")
        except Exception:
            # Let outer exception handler catch and report
            raise

        processed_text = preprocess_text(content)

        # Find topic similarities and similar documents across all year groups
        all_topic_similarities = []
        all_similar_documents = []

        for group_name, (model, num_topics, df) in all_topics.items():
            # Convert processed text to bag of words
            bow = model.id2word.doc2bow(processed_text)

            if not bow:
                continue

            # Get topic distribution for uploaded document
            doc_topics = model.get_document_topics(bow)

            if not doc_topics:
                continue

            # Get top 3 topics for this document
            top_topics = sorted(doc_topics, key=lambda x: x[1], reverse=True)[:3]

            for topic_id, probability in top_topics:
                # Get keywords for this topic
                topic_words = model.show_topic(topic_id, topn=5)
                keywords = [word for word, _ in topic_words]

                all_topic_similarities.append(
                    {
                        "year_group": group_name,
                        "topic_id": topic_id,
                        "probability": float(probability),
                        "keywords": keywords,
                        "label": f"Topic {topic_id + 1}: {', '.join(keywords[:3])}",
                    }
                )

            # Find similar documents using topic similarity
            if "processed_summary" in df.columns:
                similarities = []

                for idx, row in df.iterrows():
                    if not row.get("processed_summary"):
                        continue

                    # Get topics for corpus document
                    corpus_bow = model.id2word.doc2bow(row["processed_summary"])
                    corpus_topics = model.get_document_topics(corpus_bow)

                    if not corpus_topics:
                        continue

                    # Calculate similarity using Hellinger distance
                    from scipy.spatial.distance import cosine

                    # Convert sparse topic distributions to dense vectors
                    uploaded_vec = [0.0] * num_topics
                    for tid, prob in doc_topics:
                        uploaded_vec[tid] = prob

                    corpus_vec = [0.0] * num_topics
                    for tid, prob in corpus_topics:
                        corpus_vec[tid] = prob

                    # Calculate cosine similarity
                    try:
                        similarity = 1 - cosine(uploaded_vec, corpus_vec)
                    except:
                        similarity = 0.0

                    similarities.append(
                        {"index": idx, "similarity": similarity, "row": row}
                    )

                # Sort by similarity and get top 5 from this year group
                similarities.sort(key=lambda x: x["similarity"], reverse=True)

                for sim_doc in similarities[:5]:
                    row = sim_doc["row"]
                    try:
                        authors = parse_authors_field(row.get("authors"))
                    except:
                        authors = ["Unknown"]

                    all_similar_documents.append(
                        {
                            "title": row.get("title", "Unknown"),
                            "authors": authors,
                            "year": group_name,
                            "similarity": float(sim_doc["similarity"]),
                        }
                    )

        # Sort all similar documents by similarity and return top 10
        all_similar_documents.sort(key=lambda x: x["similarity"], reverse=True)

        # Sort topic similarities by probability
        all_topic_similarities.sort(key=lambda x: x["probability"], reverse=True)

        analysis = {
            "preprocessing_outputs": {
                "filename": file.filename,
                "word_count": len(processed_text),
                "unique_words": len(set(processed_text)),
                "sample_words": processed_text[:20],
            },
            "topic_similarity": all_topic_similarities[:10],
            "similar_documents": all_similar_documents[:10],
        }

        return jsonify(analysis)

    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR


@app.route("/api/corpus-wordcloud/<year_group>", methods=["GET"])
def corpus_wordcloud(year_group):
    """
    Generates a word cloud from the entire corpus.
    Returns the PNG file.
    """

    try:
        lda_model: LdaMulticore | None = None
        num_topics: int | None = None
        for group, (model, topic_count, df) in all_topics.items():
            if group == year_group:
                lda_model = model
                num_topics = topic_count
                break

        if lda_model is None or num_topics is None:
            return {"error": f"Group {year_group} not found"}, HTTPStatus.NOT_FOUND

        # Collect all words from all documents across all year groups
        print(f"\n{'='*70}")
        print(f"Word Clouds for Year Group: {year_group}")
        print(f"{'='*70}\n")

        # Calculate grid size for subplots
        cols = 3
        rows = (num_topics + cols - 1) // cols  # Ceiling division

        fig, axes = plt.subplots(rows, cols, figsize=(15, 5 * rows))
        fig.suptitle(
            f"Topic Word Clouds - {year_group}", fontsize=16, fontweight="bold"
        )

        # Flatten axes array for easier iteration
        if rows == 1 and cols == 1:
            axes = [axes]
        elif rows == 1 or cols == 1:
            axes = axes.flatten()
        else:
            axes = axes.flatten()

        for topic_id in range(num_topics):
            ax = axes[topic_id]

            # Get top 50 words for this topic
            topic_words = lda_model.show_topic(topic_id, topn=50)

            # Create word frequency dictionary
            word_freq = {word: float(weight) for word, weight in topic_words}

            # Generate word cloud
            wordcloud = WordCloud(
                width=400,
                height=300,
                background_color="white",
                colormap="viridis",
                relative_scaling=0.5,
                min_font_size=8,
            ).generate_from_frequencies(word_freq)

            # Display word cloud
            ax.imshow(wordcloud, interpolation="bilinear")
            ax.axis("off")

            # Get top 3 words for title
            top_words = ", ".join([word for word, _ in topic_words[:3]])
            ax.set_title(
                f"Topic {topic_id + 1}: {top_words}", fontsize=10, fontweight="bold"
            )

        # Hide any unused subplots
        for idx in range(num_topics, len(axes)):
            axes[idx].axis("off")

        # Adjust layout and save the figure with all subplots
        plt.tight_layout()

        # Save to file
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)

        return send_file(buf, mimetype="image/png")

    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR


if __name__ == "__main__":
    print("Starting the Flask application!")

    # Download NLTK data if needed
    try:
        nltk.data.find("corpora/stopwords")
        nltk.data.find("tokenizers/punkt")
        nltk.data.find("tokenizers/punkt_tab")
        nltk.data.find("corpora/wordnet")
    except LookupError:
        print("Downloading NLTK data...")
        nltk.download("stopwords", quiet=True)
        nltk.download("punkt", quiet=True)
        nltk.download("punkt_tab", quiet=True)
        nltk.download("wordnet", quiet=True)

    print("Loading dataset...")
    load_dataset()
    print("Loading topics...")
    load_topics()
    print("Loading author graph...")
    load_author_graph()

    print("Starting flask host.")
    app.run(host="0.0.0.0", port=5000, debug=True)
