# Text Analytica

A comprehensive text analytics platform for analyzing scientific research papers using LDA (Latent Dirichlet Allocation) topic modeling, author network analysis, and document similarity detection.

![Text Analytica Screenshot](frontend/public/images/text_analytica.png)

## 🌟 Features

- **Dashboard Overview**: View corpus statistics including total documents, authors, topics, and network connections
- **Corpus Documents**: Browse and search through research papers with their associated topics
- **Corpus Topics**: Explore topics by year groups with word clouds and document associations
- **Author Networks**: Visualize collaboration networks between researchers using interactive network graphs
- **Paper Analysis**: Upload research papers to find similar documents and identify relevant topics

## 🏗️ System Architecture

This is a full-stack application consisting of:

- **Frontend**: Next.js 15 (React 19) with TypeScript, Tailwind CSS, and Radix UI components
- **Backend**: Flask (Python) API serving LDA models and graph data
- **Data Processing**: Jupyter Notebook for LDA model training (optional)

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher) OR **Bun** runtime
- **Python** (v3.8 or higher)
- **Git**
- **PowerShell** (for Windows users using the startup script)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/rchrdwllm/text-analytica.git
cd text-analytica
```

### 2. Backend Setup

#### Create a Virtual Environment

```bash
cd backend
python -m venv venv
```

#### Activate the Virtual Environment

**Windows (PowerShell):**

```powershell
.\venv\Scripts\activate.ps1
```

**Windows (CMD):**

```cmd
.\venv\Scripts\activate.bat
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Download Required NLTK Data

The application will automatically download required NLTK data on first run, but you can also download it manually:

```python
python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt'); nltk.download('wordnet')"
```

#### Add Pre-trained Models

Place the following pickle files in the `backend/pickles/` directory:

```
backend/
  pickles/
    corpus_topics/
      [year_group].pkl files
    all_lda_models.pkl
    corpus_documents.pkl
    graph.pkl
    network_statistics.pkl
    trending_topics_per_group.pkl
```

> **Note**: These pickle files contain pre-trained LDA models and processed data. They should be provided separately or generated using the `lda/lda.ipynb` notebook.

### 3. Frontend Setup

```bash
cd ../frontend
```

#### Install Dependencies

**Using npm:**

```bash
npm install
```

**Using Bun (recommended):**

```bash
bun install
```

## 🎯 Running the Application

### Option 1: Using the PowerShell Script (Windows - Recommended)

From the root directory:

```powershell
.\start-dev.ps1
```

This script will:

- Start the Next.js frontend on `http://localhost:3000`
- Start the Flask backend on `http://localhost:5000`
- Open both in separate PowerShell windows

### Option 2: Manual Startup

#### Terminal 1 - Start Backend

```bash
cd backend
.\venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

python api/index.py
```

The backend will be available at `http://localhost:5000`

#### Terminal 2 - Start Frontend

```bash
cd frontend

# Using npm
npm run dev

# OR using Bun
bun dev
```

The frontend will be available at `http://localhost:3000`

## 📱 Using the Application

### Dashboard

- Access at `/dashboard`
- View overall statistics about the corpus
- See topic counts and trending topics per year group
- Visualize document distribution

### Corpus Documents

- Access at `/corpus-documents`
- Browse all research papers in the dataset
- Search by title, author, or year
- View associated topics for each document

### Corpus Topics

- Access at `/corpus-topics`
- Select a year group to explore topics
- View word clouds for visual topic representation
- See documents associated with each topic
- Explore topic keywords and their weights

### Author Networks

- Access at `/author-networks`
- Search for specific authors
- Visualize collaboration networks
- See network statistics (nodes, edges, communities, average degree)
- Explore co-authorship patterns and paper connections

### Paper Analysis

- Access at `/paper-analysis`
- Upload a research paper (PDF or text format)
- View preprocessing statistics
- Discover similar documents in the corpus
- Identify related topics with probability scores

## 🔧 API Endpoints

The backend provides the following REST API endpoints:

| Endpoint                             | Method   | Description                          |
| ------------------------------------ | -------- | ------------------------------------ |
| `/api/health`                        | GET      | Health check                         |
| `/api/corpus-overview`               | GET      | Get corpus statistics                |
| `/api/corpus-documents`              | GET      | Get all documents with topics        |
| `/api/topic-count-per-group`         | GET      | Get topic counts by year group       |
| `/api/trending-topics-per-group`     | GET      | Get trending topics with keywords    |
| `/api/corpus-topics`                 | GET      | Get topics summary by group          |
| `/api/corpus-topics/<year_group>`    | GET      | Get detailed topics for a year group |
| `/api/corpus-wordcloud/<year_group>` | GET      | Generate word cloud image            |
| `/api/author-networks`               | GET/POST | Get author collaboration network     |
| `/api/network-statistics`            | GET      | Get network graph statistics         |
| `/api/paper-analysis`                | POST     | Analyze uploaded paper               |

## 🗂️ Project Structure

```
text-analytica/
├── backend/
│   ├── api/
│   │   └── index.py          # Flask API server
│   ├── pickles/              # Pre-trained models and cached data
│   ├── requirements.txt      # Python dependencies
│   └── vercel.json          # Vercel deployment config
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Dashboard page
│   │   ├── corpus-documents/
│   │   ├── corpus-topics/
│   │   ├── author-networks/
│   │   └── paper-analysis/
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript types
│   └── package.json         # Node dependencies
├── lda/
│   └── lda.ipynb           # Jupyter notebook for model training
└── start-dev.ps1           # Development startup script
```

## 🛠️ Technologies Used

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **D3.js** - Network graph visualization
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client

### Backend

- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Gensim** - LDA topic modeling
- **NetworkX** - Graph analysis
- **NLTK** - Natural language processing
- **Pandas** - Data manipulation
- **scikit-learn** - Machine learning utilities
- **PyPDF2** - PDF text extraction
- **WordCloud** - Word cloud generation
- **Matplotlib** - Visualization

## 🧪 Development

### Running Tests

```bash
cd frontend
npm test  # or bun test
```

### Building for Production

**Frontend:**

```bash
cd frontend
npm run build  # or bun run build
npm start
```

**Backend:**
The Flask application is production-ready. For deployment, consider using:

- Vercel (configured with `vercel.json`)
- Docker
- Traditional WSGI server (Gunicorn, uWSGI)

## 📊 Data Processing

The LDA models are trained using the Jupyter notebook in `lda/lda.ipynb`. To retrain models:

1. Open the notebook:

   ```bash
   cd lda
   jupyter notebook lda.ipynb
   ```

2. Follow the notebook cells to:
   - Download the ArXiv dataset from Kaggle
   - Preprocess text data
   - Train LDA models for different year groups
   - Export pickle files to `backend/pickles/`

## 🔒 Environment Variables

The application currently doesn't require environment variables for basic operation. However, you may want to configure:

- **Backend Port**: Default is 5000 (change in `api/index.py`)
- **Frontend Port**: Default is 3000 (change with `PORT` environment variable)

## 🐛 Troubleshooting

### Backend Issues

**"Virtual environment not found"**

- Ensure you created the venv: `python -m venv venv`
- Check the path in `start-dev.ps1` matches your setup

**"No module named 'X'"**

- Activate venv and run: `pip install -r requirements.txt`

**"Pickle files not found"**

- Ensure all required `.pkl` files are in `backend/pickles/`
- Run the LDA notebook to generate models

### Frontend Issues

**"Module not found"**

- Run: `npm install` or `bun install`

**"Port 3000 already in use"**

- Kill the process or change the port: `PORT=3001 npm run dev`

### CORS Errors

- Ensure backend is running on port 5000
- Check Flask-CORS configuration in `api/index.py`

## 📝 License

This project is part of academic coursework for ITE 406.

## 👥 Contributors

- Richard William ([@rchrdwllm](https://github.com/rchrdwllm))

## 🙏 Acknowledgments

- ArXiv Scientific Research Papers Dataset from Kaggle
- Next.js and React communities
- Flask and Python data science communities

---

For questions or issues, please create an issue in the GitHub repository.
