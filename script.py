import random
from collections import defaultdict, Counter

# --- Sample corpus ---
documents = [
    ["apple", "banana", "orange"],
    ["apple", "car", "train"],
    ["bus", "car", "train"]
]

# --- Hyperparameters ---
K = 2                # number of topics (for simplicity)
alpha = 0.1          # Dirichlet prior for document-topic distribution
beta = 0.1           # Dirichlet prior for topic-word distribution
iterations = 30      # number of Gibbs sampling iterations

# --- Initialize vocabulary ---
vocab = sorted({w for doc in documents for w in doc})
V = len(vocab)
word2id = {w: i for i, w in enumerate(vocab)}

# --- Randomly assign initial topics ---
D = len(documents)
z = []  # topic assignments per word
doc_topic_count = [Counter() for _ in range(D)]
topic_word_count = [Counter() for _ in range(K)]
topic_totals = [0] * K

for d, doc in enumerate(documents):
    topics = []
    for w in doc:
        topic = random.randint(0, K - 1)
        topics.append(topic)
        doc_topic_count[d][topic] += 1
        topic_word_count[topic][w] += 1
        topic_totals[topic] += 1
    z.append(topics)

# --- Gibbs Sampling Loop ---
for it in range(iterations):
    for d, doc in enumerate(documents):
        for i, w in enumerate(doc):
            old_topic = z[d][i]
            # remove current word's topic assignment
            doc_topic_count[d][old_topic] -= 1
            topic_word_count[old_topic][w] -= 1
            topic_totals[old_topic] -= 1

            # compute conditional probability for each topic
            probs = []
            for k in range(K):
                word_prob = (topic_word_count[k][w] + beta) / (topic_totals[k] + V * beta)
                topic_prob = (doc_topic_count[d][k] + alpha)
                probs.append(word_prob * topic_prob)

            # normalize probabilities
            total = sum(probs)
            probs = [p / total for p in probs]

            # sample new topic
            new_topic = random.choices(range(K), weights=probs)[0]
            z[d][i] = new_topic

            # update counts
            doc_topic_count[d][new_topic] += 1
            topic_word_count[new_topic][w] += 1
            topic_totals[new_topic] += 1

    print(f"=" * 20)
    print(f"ITERATION {it + 1}")
    # --- Display Results ---
    print("\nTopic-word distributions:")
    for k in range(K):
        total = sum(topic_word_count[k].values())
        print(f"Topic {k}:")
        for w, c in topic_word_count[k].most_common():
            print(f"  {w:<10} {c/total:.2f}")

    print("\nDocument-topic distributions:")
    for d in range(D):
        total = sum(doc_topic_count[d].values())
        print(f"Doc {d+1}: ", end="")
        for k in range(K):
            print(f"Topic{k}:{doc_topic_count[d][k]/total:.2f} ", end="")
        print()