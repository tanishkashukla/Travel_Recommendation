import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


# Columns used for display
IDENTITY_COLS = [
    "item_id",
    "popular_destination",
    "city",
    "state",
    "latitude",
    "longitude",
    "synthetic_review",
]


# ------------------------------------------------
# Load features
# ------------------------------------------------
def load_features(features_csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(features_csv_path)
    df.columns = [c.strip().lower() for c in df.columns]
    return df


# ------------------------------------------------
# Build matrix for similarity
# ------------------------------------------------
def build_item_matrix(df_features: pd.DataFrame):

    meta_cols = [c for c in IDENTITY_COLS if c in df_features.columns]
    meta_df = df_features[meta_cols].copy()

    drop_cols = set(meta_cols)
    feature_cols = [c for c in df_features.columns if c not in drop_cols]

    X = df_features[feature_cols].copy()

    for c in feature_cols:
        X[c] = pd.to_numeric(X[c], errors="coerce").fillna(0.0)

    X = X.values.astype(float)

    return meta_df, X, feature_cols


# ------------------------------------------------
# Fallback: Popular places
# ------------------------------------------------
def _fallback_popular(df, top_n):

    meta_cols = [c for c in IDENTITY_COLS if c in df.columns]
    out = df[meta_cols].copy()

    if "popularity_score_norm" in df.columns:
        out["rank_score"] = df["popularity_score_norm"]

    elif "estimated_visits_norm" in df.columns:
        out["rank_score"] = df["estimated_visits_norm"]

    elif "google_rating_norm" in df.columns:
        out["rank_score"] = df["google_rating_norm"]

    else:
        out["rank_score"] = 0.0

    out = out.sort_values("rank_score", ascending=False)
    out = out.head(top_n)

    out = out.drop(columns=["rank_score"], errors="ignore")

    return out.reset_index(drop=True)


# ------------------------------------------------
# Build preference vector
# ------------------------------------------------
def _make_preference_vector(feature_cols, prefs):

    v = np.zeros(len(feature_cols), dtype=float)

    def norm(x):
        return str(x).strip().lower()

    # One-hot matching
    def set_onehot(prefix, value):

        if not value:
            return

        prefix = norm(prefix)
        value = norm(value)

        for i, col in enumerate(feature_cols):

            if col.startswith(prefix + "_"):

                col_val = col.split("_", 1)[1].lower()

                if value in col_val or col_val in value:
                    v[i] = 1.0
                    return

    # Categorical
    set_onehot("place_category", prefs.get("place_category"))
    set_onehot("interest", prefs.get("interest"))
    set_onehot("crowd_level", prefs.get("crowd_level"))
    set_onehot("best_season_to_visit", prefs.get("best_season_to_visit"))
    set_onehot("state", prefs.get("state"))

    # Numeric helpers
    def set_numeric(col, level):

        if col not in feature_cols:
            return

        idx = feature_cols.index(col)

        level = norm(level)

        if level == "low":
            v[idx] = 0.2
        elif level == "medium":
            v[idx] = 0.6
        elif level == "high":
            v[idx] = 1.0

    # Budget
    if prefs.get("prefer_budget"):

        if "price_fare_norm" in feature_cols:

            idx = feature_cols.index("price_fare_norm")

            if prefs["prefer_budget"] == "low":
                v[idx] = 0.1
            elif prefs["prefer_budget"] == "medium":
                v[idx] = 0.5
            elif prefs["prefer_budget"] == "high":
                v[idx] = 0.9

    # Popularity / rating
    if prefs.get("prefer_popularity"):
        set_numeric("popularity_score_norm", prefs["prefer_popularity"])
        set_numeric("estimated_visits_norm", prefs["prefer_popularity"])

    if prefs.get("prefer_rating"):
        set_numeric("google_rating_norm", prefs["prefer_rating"])

    return v


# ------------------------------------------------
# Preference-based recommendation
# ------------------------------------------------
def recommend_by_preferences(df_features, top_n=10, **prefs):

    meta_df, X, feature_cols = build_item_matrix(df_features)

    q = _make_preference_vector(feature_cols, prefs).reshape(1, -1)

    sims = cosine_similarity(q, X).flatten()

    recs = meta_df.copy()
    recs["similarity_score"] = sims

    recs = recs.sort_values("similarity_score", ascending=False)
    recs = recs.head(top_n)

    return recs.reset_index(drop=True)


# ------------------------------------------------
# Similar to destination
# ------------------------------------------------
def recommend_similar_to_destination(df_features, destination_name, top_n=10):

    df = df_features.copy()

    if "popular_destination" not in df.columns:
        raise ValueError("popular_destination column not found.")

    if not destination_name or str(destination_name).strip() == "":
        return _fallback_popular(df, top_n)

    name = str(destination_name).strip().lower()

    mask = df["popular_destination"].astype(str).str.lower().str.contains(name, na=False)
    candidates = df[mask]

    if candidates.empty:
        recs = _fallback_popular(df, top_n)
        recs["note"] = "Input not found. Showing popular places."
        return recs

    if "popularity_score_norm" in df.columns:
        anchor_idx = candidates.sort_values("popularity_score_norm", ascending=False).index[0]

    elif "google_rating_norm" in df.columns:
        anchor_idx = candidates.sort_values("google_rating_norm", ascending=False).index[0]

    else:
        anchor_idx = candidates.index[0]

    meta_df, X, feature_cols = build_item_matrix(df)

    anchor_vec = X[anchor_idx].reshape(1, -1)

    sims = cosine_similarity(anchor_vec, X).flatten()

    recs = meta_df.copy()
    recs["similarity_score"] = sims

    recs = recs.drop(index=anchor_idx, errors="ignore")

    recs = recs.sort_values("similarity_score", ascending=False)

    recs = recs.head(top_n)

    return recs.reset_index(drop=True)
