from pathlib import Path
import pandas as pd

from src.recommenders.collaborative import (
    load_ratings,
    load_places,
    recommend_for_user_userbased,
    get_available_users
)

BASE_DIR = Path(__file__).resolve().parent

RATINGS_CSV = BASE_DIR / "data" / "simulated" / "user_ratings.csv"
PLACES_CSV  = BASE_DIR / "data" / "processed" / "places_clean_with_id.csv"

OUT_DIR = BASE_DIR / "reports" / "recommendations"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    ratings_df = load_ratings(str(RATINGS_CSV))
    places_df = load_places(str(PLACES_CSV))

    # Pick a demo user (you can change)
    sample_first, sample_last = get_available_users(ratings_df, n=5)
    demo_user = sample_first[0]

    print("✅ Ratings loaded:", ratings_df.shape)
    print("✅ Places loaded:", places_df.shape)
    print("Demo user:", demo_user)
    print("Some users:", sample_first, "...", sample_last)

    recs = recommend_for_user_userbased(
        ratings_df=ratings_df,
        places_df=places_df,
        target_user_id=demo_user,
        top_n=10,
        k_neighbors=15
    )

    out_file = OUT_DIR / "collaborative_userbased.csv"
    recs.to_csv(out_file, index=False)

    print("\n✅ Collaborative recommendations saved to:", out_file)
    print("\nTop 5:")
    print(recs.head(5))


if __name__ == "__main__":
    main()
