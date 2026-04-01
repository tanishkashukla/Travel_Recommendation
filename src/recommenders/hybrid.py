import pandas as pd


def hybrid_merge_and_rank(
    content_df: pd.DataFrame,
    cf_df: pd.DataFrame,
    alpha: float = 0.6,
    top_n: int = 10
) -> pd.DataFrame:
    """
    Merge content-based recs and collaborative recs on item_id and compute hybrid score.

    Expected columns:
      content_df: item_id, similarity_score (content)
      cf_df: item_id, cf_score (collaborative)

    hybrid_score = alpha*content_norm + (1-alpha)*cf_norm
    """

    if "item_id" not in content_df.columns or "item_id" not in cf_df.columns:
        raise ValueError("Both dataframes must contain item_id")

    c = content_df.copy()
    u = cf_df.copy()

    # Keep minimal columns + metadata
    content_cols = list(dict.fromkeys(["item_id", "similarity_score"] + [col for col in c.columns if col != "cf_score"]))
    cf_cols = list(dict.fromkeys(["item_id", "cf_score"] + [col for col in u.columns if col != "similarity_score"]))

    c = c[content_cols]
    u = u[cf_cols]

    merged = pd.merge(c, u[["item_id", "cf_score"]], on="item_id", how="outer")

    # Fill missing scores with 0
    merged["similarity_score"] = merged["similarity_score"].fillna(0.0)
    merged["cf_score"] = merged["cf_score"].fillna(0.0)

    # Normalize scores to 0-1 (so scale differences don’t dominate)
    def minmax(s):
        s = s.astype(float)
        if s.max() - s.min() < 1e-9:
            return s * 0.0
        return (s - s.min()) / (s.max() - s.min())

    merged["content_norm"] = minmax(merged["similarity_score"])
    merged["cf_norm"] = minmax(merged["cf_score"])

    merged["hybrid_score"] = alpha * merged["content_norm"] + (1 - alpha) * merged["cf_norm"]

    merged = merged.sort_values("hybrid_score", ascending=False).head(top_n)

    # Clean up
    cols_order = []
    for col in ["item_id", "hybrid_score", "similarity_score", "cf_score"]:
        if col in merged.columns:
            cols_order.append(col)

    rest = [c for c in merged.columns if c not in cols_order and c not in ["content_norm", "cf_norm"]]
    merged = merged[cols_order + rest]

    return merged.reset_index(drop=True)
