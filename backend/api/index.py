from http import HTTPStatus
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
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from collections import Counter

import re
from scipy.spatial.distance import cosine

app = Flask(__name__)
CORS(app)

# Global object
dataset_df: pd.DataFrame = None
all_authors: nx.MultiGraph = None
all_topics: dict[str, tuple[LdaMulticore, int, pd.DataFrame]] = {}

def save_pickle(path: str, object: Any):
    path_obj = Path(path)
    if not os.path.exists(path_obj.parent):
        os.makedirs(path_obj.parent)

    with open(path_obj, "wb") as f:
        pickle.dump(object, f)

def load_pickle(path: str) -> Any | None:
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return None

def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    # Remove non-alphanumeric characters and tokenize
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = nltk.word_tokenize(text)
    # Remove stop words
    stop_words = set(stopwords.words('english'))
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
    try:
        if os.path.exists("graph.pkl"):
            with open("graph.pkl", "rb") as f:
                all_authors = pickle.load(f)
                return
        raise Exception()
    except:
        # Initialize an empty graph
        G = nx.Graph()

        # Iterate through each row of the DataFrame
        for index, row in dataset_df.iterrows():
            print(f"{index}/{len(dataset_df)}")
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
        model_path = f"graph.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(all_authors, f)


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
    documents = []

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
                        words = [word for word, _ in model.show_topic(topic_id, topn=5)]
                        topic_keywords.append(f"{', '.join(words)} ({prob:.2f})")
                    topics_str = " | ".join(topic_keywords)

            documents.append(
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

    return jsonify(documents), 200


@app.route("/api/topic-count-per-group")
def topic_count_per_year():
    """
    Returns the topic count per group.
    """
    result = []
    for group_name, (model, num_topics, df) in all_topics.items():
        result.append(
            {
                "group": group_name,
                "topic_count": num_topics,
                "document_count": df.nunique(),
            }
        )
    return jsonify(result)


@app.route("/api/trending-topics-per-year")
def trending_topics_per_year():
    """
    Returns the trending topics per year with top keywords.
    """
    result = []
    for group_name, (model, num_topics, df) in all_topics.items():
        # Get all topics for this year group
        topics_data = []

        for topic_id in range(num_topics):
            # Get top 10 words for this topic
            top_words = model.show_topic(topic_id, topn=10)
            keywords = [
                {"word": word, "weight": float(weight)} for word, weight in top_words
            ]

            # Calculate topic prevalence by counting how many documents have this as dominant topic
            topic_count = 0
            if "summary" in df.columns:
                for _, row in df.iterrows():
                    if row.get("summary"):
                        processed_summary = preprocess_text(row.get("summary"))
                        bow = model.id2word.doc2bow(processed_summary)
                        doc_topics = model.get_document_topics(bow)
                        if doc_topics:
                            dominant_topic = max(doc_topics, key=lambda x: x[1])[0]
                            if dominant_topic == topic_id:
                                topic_count += 1

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

    return jsonify(result)


@app.route("/api/corpus-topics")
def corpus_topics():
    """
    Returns topics per year and a single overall word cloud for the entire corpus.
    """
    topics_by_year = []
    # Aggregate ALL words across ALL topics and ALL years for overall word cloud
    overall_word_weights = {}

    for group_name, (model, num_topics, df) in all_topics.items():
        topics_list = []

        for topic_id in range(num_topics):
            # Get top 10 words for this topic
            top_words = model.show_topic(topic_id, topn=10)

            # Count documents with this as dominant topic
            doc_count = 0
            if "processed_summary" in df.columns:
                for _, row in df.iterrows():
                    if row.get("processed_summary"):
                        bow = model.id2word.doc2bow(row["processed_summary"])
                        doc_topics = model.get_document_topics(bow)
                        if doc_topics:
                            dominant_topic = max(doc_topics, key=lambda x: x[1])[0]
                            if dominant_topic == topic_id:
                                doc_count += 1

            # Get top 5 words for label
            top_5_words = ", ".join([w for w, _ in top_words[:5]])

            topics_list.append(
                {
                    "topic_id": topic_id,
                    "label": f"Topic {topic_id + 1}: {top_5_words}",
                    "document_count": doc_count
                }
            )
            # Accumulate words for overall word cloud
            for word, weight in top_words:
                if word in overall_word_weights:
                    overall_word_weights[word] += weight
                else:
                    overall_word_weights[word] = weight

        topics_by_year.append({
            "year": group_name,
            "topics": topics_list,
            "total_documents": len(df)
        })

    # Prepare overall word cloud (top 100 words across entire corpus)
    sorted_overall = sorted(
        overall_word_weights.items(),
        key=lambda x: x[1],
        reverse=True
    )[:100]

    # Normalize weights to 0-100 scale for word cloud
    if sorted_overall:
        max_weight = max([weight for _, weight in sorted_overall])
        min_weight = min([weight for _, weight in sorted_overall])
        weight_range = max_weight - min_weight if max_weight != min_weight else 1

        overall_wordcloud = [
            {
                "text": word,
                "value": float(((weight - min_weight) / weight_range) * 100)
            }
            for word, weight in sorted_overall
        ]
    else:
        overall_wordcloud = []

    return jsonify({
        "topics_by_year": topics_by_year,
        "wordcloud": overall_wordcloud  # Single word cloud for ENTIRE corpus
    })


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
            return jsonify({"nodes": [], "links": [], "message": "Author not found"}), 200

        nodes.append({"id": author_name, "group": "author"})
        added_nodes.add(author_name)

        neighbors = list(all_authors.neighbors(author_name))

        for co_author in neighbors[:50]:
            if co_author not in added_nodes:
                weight = all_authors[author_name][co_author].get("weight", 1)
                nodes.append({"id": co_author, "group": "co-author", "weight": weight})
                added_nodes.add(co_author)

            link_key = tuple(sorted([author_name, co_author]))
            if link_key not in added_links:
                weight = all_authors[author_name][co_author].get("weight", 1)
                links.append({"source": author_name, "target": co_author, "value": weight})
                added_links.add(link_key)

        # papers
        for group_name, (model, num_topics, df) in all_topics.items():
            if "authors" in df.columns and "title" in df.columns:
                for _, doc in df.iterrows():
                    authors_list = parse_authors_field(doc.get("authors"))
                    if author_name in authors_list:
                            paper_id = doc.get("title", "Unknown")
                            if paper_id not in added_nodes:
                                nodes.append({"id": paper_id, "group": "paper", "year": group_name})
                                added_nodes.add(paper_id)

                            link_key = (author_name, paper_id)
                            if link_key not in added_links:
                                links.append({"source": author_name, "target": paper_id, "value": 1})
                                added_links.add(link_key)

                            for co_author in authors_list:
                                if co_author != author_name and co_author in added_nodes:
                                    link_key = (co_author, paper_id)
                                    if link_key not in added_links:
                                        links.append({"source": co_author, "target": paper_id, "value": 1})
                                        added_links.add(link_key)

        response = {"nodes": nodes, "links": links}
        return jsonify(response)

    # Otherwise return a limited full graph summary (cap sizes)
    nodes = []
    links = []
    # compute weighted degree for node sizing
    try:
        weighted_degrees = {n: int(all_authors.degree(n, weight="weight") or 0) for n in all_authors.nodes()}
    except Exception:
        weighted_degrees = {n: 0 for n in all_authors.nodes()}

    # limit nodes to first 1000 and links to first 2000 to keep payload reasonable
    node_list = list(all_authors.nodes())[:1000]
    for n in node_list:
        nodes.append({"id": n, "group": "author", "weight": weighted_degrees.get(n, 0)})

    for u, v, data in list(all_authors.edges(data=True))[:2000]:
        links.append({"source": u, "target": v, "value": data.get("weight", 1)})

    return jsonify({"nodes": nodes, "links": links, "statistics": {"nodes": len(nodes), "links": len(links)}})


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
            "average_degree": average_degree
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

        # Import preprocessing function (assuming it exists)
        from nltk.corpus import stopwords
        from nltk.stem import WordNetLemmatizer
        import nltk
        import re

        # Preprocess the uploaded document
        def preprocess_text(text):
            # Lowercase
            text = text.lower()
            # Remove special characters and digits (replace with space to keep token boundaries)
            text = re.sub(r"[^a-zA-Z\s]", " ", text)

            # Tokenize — prefer NLTK, but fall back to a simple regex tokenizer if NLTK data is missing
            try:
                tokens = nltk.word_tokenize(text)
            except LookupError:
                # nltk punkt tokenizer missing (e.g. 'punkt_tab' or 'punkt') — fallback
                tokens = re.findall(r"\b[a-zA-Z]{2,}\b", text)

            # Remove stopwords — fall back to a small built-in set if resource missing
            try:
                stop_words = set(stopwords.words("english"))
            except LookupError:
                stop_words = {
                    "the",
                    "and",
                    "that",
                    "this",
                    "for",
                    "with",
                    "from",
                    "have",
                    "were",
                    "which",
                    "would",
                    "there",
                    "their",
                    "about",
                    "into",
                    "until",
                    "than",
                    "also",
                    "been",
                }

            tokens = [word for word in tokens if word not in stop_words and len(word) > 3]

            # Lemmatization (best-effort)
            try:
                lemmatizer = WordNetLemmatizer()
                tokens = [lemmatizer.lemmatize(word) for word in tokens]
            except Exception:
                # If lemmatizer or wordnet data missing, just continue with tokens
                pass

            return tokens

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


@app.route("/api/corpus-wordcloud")
def corpus_wordcloud():
    """
    Generates a word cloud from the entire corpus.
    Returns the PNG file. Caches the result to avoid recomputation.
    """
    wordcloud_path = "corpus_wordcloud.png"

    # Check if cached file exists
    if os.path.exists(wordcloud_path):
        return send_file(wordcloud_path, mimetype='image/png')

    try:
        # Collect all words from all documents across all year groups
        all_words = []
        
        for group_name, (model, num_topics, df) in all_topics.items():
            if "processed_summary" in df.columns:
                for _, row in df.iterrows():
                    if row.get("processed_summary") and isinstance(row["processed_summary"], list):
                        all_words.extend(row["processed_summary"])
            elif "summary" in df.columns:
                # Process summaries if not already processed
                for _, row in df.iterrows():
                    if row.get("summary"):
                        processed = preprocess_text(row["summary"])
                        all_words.extend(processed)
        
        if not all_words:
            return jsonify({"error": "No words found in corpus"}), HTTPStatus.BAD_REQUEST
        
        # Count word frequencies
        word_freq = Counter(all_words)
        
        # Generate word cloud
        wordcloud = WordCloud(
            width=1600,
            height=800,
            background_color='white',
            colormap='viridis',
            relative_scaling=0.5,
            min_font_size=10,
            max_words=200,
            prefer_horizontal=0.7
        ).generate_from_frequencies(word_freq)
        
        # Save to file
        plt.figure(figsize=(20, 10))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.tight_layout(pad=0)
        plt.savefig(wordcloud_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close()
        
        return send_file(wordcloud_path, mimetype='image/png')

    except Exception as e:
        return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR


if __name__ == "__main__":
    print("Starting the Flask application!")

    # Download NLTK data if needed
    try:
        nltk.data.find("corpora/stopwords")
        nltk.data.find("tokenizers/punkt")
        nltk.data.find("corpora/wordnet")
    except LookupError:
        print("Downloading NLTK data...")
        nltk.download("stopwords", quiet=True)
        nltk.download("punkt", quiet=True)
        nltk.download("wordnet", quiet=True)

    print("Loading dataset...")
    load_dataset()
    print("Loading topics...")
    load_topics()
    print("Loading author graph...")
    load_author_graph()

    print("Starting flask host.")
    app.run(host="0.0.0.0", port=5000, debug=True)
