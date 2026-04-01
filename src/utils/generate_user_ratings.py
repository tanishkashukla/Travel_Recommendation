import pandas as pd
import numpy as np
from pathlib import Path
import random


# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parents[2]

CLEAN_CSV = BASE_DIR / "data" / "processed" / "places_clean.csv"
OUT_DIR = BASE_DIR / "data" / "simulated"

RATINGS_FILE = OUT_DIR / "user_ratings.csv"
UPDATED_CLEAN_FILE = BASE_DIR / "data" / "processed" / "places_clean_with_id.csv"


# -----------------------------
# Settings
# -----------------------------
NUM_USERS = 100
MIN_RATINGS = 20
MAX_RATINGS = 60


# -----------------------------
# Generate Ratings
# -----------------------------
def generate_ratings():

    print("Loading dataset...")

    df = pd.read_csv(CLEAN_CSV)

    # -----------------------------
    # Create item_id if missing
    # -----------------------------
    if "item_id" not in df.columns:

        print("item_id not found. Creating new IDs...")

        df = df.reset_index(drop=True)
        df["item_id"] = df.index + 1

        df.to_csv(UPDATED_CLEAN_FILE, index=False)

        print("Saved updated file with item_id:")
        print(UPDATED_CLEAN_FILE)

    place_ids = df["item_id"].tolist()

    # -----------------------------
    # Create users
    # -----------------------------
    users = [f"U{i}" for i in range(1, NUM_USERS + 1)]

    rows = []

    print("Generating fake ratings...")

    for user in users:

        n = random.randint(MIN_RATINGS, MAX_RATINGS)

        sampled = random.sample(place_ids, n)

        for pid in sampled:

            rating = np.clip(
                np.random.normal(loc=3.8, scale=0.9),
                1.0,
                5.0
            )

            rating = round(float(rating), 1)

            rows.append({
                "user_id": user,
                "item_id": pid,
                "rating": rating
            })

    ratings_df = pd.DataFrame(rows)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    ratings_df.to_csv(RATINGS_FILE, index=False)

    print("\nDone ✅")
    print("Users:", len(users))
    print("Ratings:", len(ratings_df))
    print("Ratings saved to:", RATINGS_FILE)


# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":
    generate_ratings()
