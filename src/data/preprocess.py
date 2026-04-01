import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Columns expected from your screenshot
EXPECTED_COLUMNS = [
    "state", "city", "popular_destination", "latitude", "longitude", "interest",
    "google_rating", "price_fare", "place_category", "estimated_visits",
    "popularity_score", "best_season_to_visit", "crowd_level", "synthetic_review",
    "sentiment_score", "experience_score"
]

def load_raw(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    # Standardize column names (safe)
    df.columns = [c.strip().lower() for c in df.columns]
    return df

def basic_clean(df: pd.DataFrame) -> pd.DataFrame:
    # Drop fully empty rows
    df = df.dropna(how="all").copy()

    # Remove duplicates
    df = df.drop_duplicates()

    # Trim spaces in object columns
    obj_cols = df.select_dtypes(include=["object"]).columns
    for c in obj_cols:
        df[c] = df[c].astype(str).str.strip()

    # Convert numeric columns safely
    numeric_cols = ["latitude", "longitude", "google_rating", "price_fare",
                    "estimated_visits", "popularity_score", "sentiment_score", "experience_score"]
    for c in numeric_cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    # Handle missing values (simple + explainable)
    # numeric -> median, categorical -> mode
    for c in numeric_cols:
        if c in df.columns and df[c].isna().any():
            df[c] = df[c].fillna(df[c].median())

    cat_cols = ["state", "city", "interest", "place_category", "best_season_to_visit", "crowd_level"]
    for c in cat_cols:
        if c in df.columns and df[c].isna().any():
            mode_val = df[c].mode(dropna=True)
            df[c] = df[c].fillna(mode_val.iloc[0] if len(mode_val) else "Unknown")

    # Keep ratings within plausible range (safety)
    if "google_rating" in df.columns:
        df["google_rating"] = df["google_rating"].clip(lower=0, upper=5)

    # Ensure price_fare is non-negative
    if "price_fare" in df.columns:
        df["price_fare"] = df["price_fare"].clip(lower=0)

    return df

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Produces a lightweight feature table ready for recommendation modules.
    - Normalizes numeric columns
    - One-hot encodes key categorical columns
    """
    df = df.copy()

    # Create an item_id for internal use (stable)
    df["item_id"] = np.arange(len(df))

    # Normalize numeric columns for later scoring
    num_cols = ["google_rating", "popularity_score", "estimated_visits", "sentiment_score", "experience_score", "price_fare"]
    existing_num = [c for c in num_cols if c in df.columns]

    scaler = MinMaxScaler()
    for c in existing_num:
        df[c] = df[c].fillna(df[c].median())

    df_norm = df[existing_num].copy()
    if existing_num:
        df_norm = pd.DataFrame(scaler.fit_transform(df_norm), columns=[f"{c}_norm" for c in existing_num])

    # One-hot encode these for content-based filtering
    cat_for_ohe = ["place_category", "interest", "crowd_level", "best_season_to_visit", "state"]
    existing_cat = [c for c in cat_for_ohe if c in df.columns]
    df_ohe = pd.get_dummies(df[existing_cat], prefix=existing_cat, drop_first=False)

    # Minimal identity columns to keep
    id_cols = ["item_id", "popular_destination", "city", "state", "latitude", "longitude", "synthetic_review"]
    existing_id = [c for c in id_cols if c in df.columns]

    features = pd.concat([df[existing_id], df_norm, df_ohe], axis=1)
    return features

def write_summary(df: pd.DataFrame) -> str:
    lines = []
    lines.append("DATASET SUMMARY")
    lines.append("-" * 60)
    lines.append(f"Rows (items): {df.shape[0]}")
    lines.append(f"Columns: {df.shape[1]}")
    lines.append("")
    lines.append("Column dtypes:")
    lines.append(df.dtypes.to_string())
    lines.append("")
    lines.append("Missing values (top):")
    miss = df.isna().sum().sort_values(ascending=False)
    lines.append(miss[miss > 0].to_string() if (miss > 0).any() else "No missing values found.")
    lines.append("")
    if "place_category" in df.columns:
        lines.append("Top place categories:")
        lines.append(df["place_category"].value_counts().head(10).to_string())
        lines.append("")
    if "state" in df.columns:
        lines.append("Top states:")
        lines.append(df["state"].value_counts().head(10).to_string())
        lines.append("")
    return "\n".join(lines)
