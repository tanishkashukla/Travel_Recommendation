import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix


def load_ratings(ratings_csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(ratings_csv_path)
    df.columns = [c.strip().lower() for c in df.columns]
    required = {"user_id", "item_id", "rating"}
    if not required.issubset(set(df.columns)):
        raise ValueError(f"ratings file must contain columns: {required}")
    return df


def load_places(places_csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(places_csv_path)
    df.columns = [c.strip().lower() for c in df.columns]
    if "item_id" not in df.columns:
        raise ValueError("places file must contain item_id")
    return df


def build_user_item_matrix(ratings_df: pd.DataFrame):
    """
    Returns:
      user_item_sparse: csr matrix (num_users x num_items)
      users: index list of user_ids
      items: index list of item_ids
      user_index: dict user_id -> row index
      item_index: dict item_id -> col index
    """
    users = sorted(ratings_df["user_id"].unique().tolist())
    items = sorted(ratings_df["item_id"].unique().tolist())

    user_index = {u: i for i, u in enumerate(users)}
    item_index = {it: j for j, it in enumerate(items)}

    row_ind = ratings_df["user_id"].map(user_index).values
    col_ind = ratings_df["item_id"].map(item_index).values
    data = ratings_df["rating"].astype(float).values

    user_item_sparse = csr_matrix((data, (row_ind, col_ind)), shape=(len(users), len(items)))
    return user_item_sparse, users, items, user_index, item_index


def recommend_for_user_userbased(
    ratings_df: pd.DataFrame,
    places_df: pd.DataFrame,
    target_user_id: str,
    top_n: int = 10,
    k_neighbors: int = 15
) -> pd.DataFrame:
    """
    User-based Collaborative Filtering:
    - find similar users via cosine similarity on the rating matrix
    - score items by weighted sum of neighbor ratings
    - recommend items target user hasn't rated
    """

    user_item, users, items, user_index, item_index = build_user_item_matrix(ratings_df)

    if target_user_id not in user_index:
        raise ValueError(f"User {target_user_id} not found in ratings dataset")

    target_row = user_index[target_user_id]

    # Cosine similarity: (1 x num_users)
    sims = cosine_similarity(user_item[target_row], user_item).flatten()

    # Exclude self
    sims[target_row] = 0.0

    # Top-k similar users
    neighbor_idx = np.argsort(sims)[::-1][:k_neighbors]
    neighbor_sims = sims[neighbor_idx]

    # Items already rated by target user
    target_rated_items = set(ratings_df.loc[ratings_df["user_id"] == target_user_id, "item_id"].tolist())

    # Predict scores for all items using neighbors
    # score(item) = sum(sim(u)*rating(u,item)) / sum(|sim(u)|)
    denom = np.sum(np.abs(neighbor_sims)) + 1e-9

    # Gather neighbor ratings submatrix
    neighbor_matrix = user_item[neighbor_idx]  # (k x num_items)
    # Weighted sum across neighbors
    weighted_scores = (neighbor_sims.reshape(-1, 1) * neighbor_matrix.toarray()).sum(axis=0) / denom

    # Build candidate list excluding already-rated
    candidates = []
    for j, item_id in enumerate(items):
        if item_id in target_rated_items:
            continue
        candidates.append((item_id, float(weighted_scores[j])))

    candidates.sort(key=lambda x: x[1], reverse=True)
    top = candidates[:top_n]

    recs = pd.DataFrame(top, columns=["item_id", "cf_score"])

    # Join place metadata for final output
    meta_cols = [c for c in [
        "item_id", "popular_destination", "city", "state", "latitude", "longitude",
        "place_category", "interest", "best_season_to_visit", "crowd_level",
        "google_rating", "price_fare", "estimated_visits", "popularity_score",
        "synthetic_review", "sentiment_score", "experience_score"
    ] if c in places_df.columns]

    out = recs.merge(places_df[meta_cols], on="item_id", how="left")

    # Nice ordering
    first_cols = [c for c in ["item_id", "popular_destination", "city", "state", "cf_score"] if c in out.columns]
    rest_cols = [c for c in out.columns if c not in first_cols]
    out = out[first_cols + rest_cols]

    return out


def get_available_users(ratings_df: pd.DataFrame, n: int = 10):
    users = sorted(ratings_df["user_id"].unique().tolist())
    return users[:n], users[-n:]
