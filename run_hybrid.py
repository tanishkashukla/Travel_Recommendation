from pathlib import Path

from src.recommenders.content_based import (
    load_features,
    recommend_by_preferences,
    recommend_similar_to_destination
)
from src.recommenders.collaborative import (
    load_ratings,
    load_places,
    recommend_for_user_userbased,
    get_available_users
)
from src.recommenders.hybrid import hybrid_merge_and_rank

BASE_DIR = Path(__file__).resolve().parent

FEATURES_CSV = BASE_DIR / "data" / "processed" / "places_features.csv"
PLACES_CSV   = BASE_DIR / "data" / "processed" / "places_clean_with_id.csv"
RATINGS_CSV  = BASE_DIR / "data" / "simulated" / "user_ratings.csv"

OUT_DIR = BASE_DIR / "reports" / "recommendations"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # ----- Load data -----
    df_features = load_features(str(FEATURES_CSV))
    places_df = load_places(str(PLACES_CSV))
    ratings_df = load_ratings(str(RATINGS_CSV))

    # Pick a demo user
    sample_first, _ = get_available_users(ratings_df, n=5)
    demo_user = sample_first[0]

    print("Demo user:", demo_user)

    # ----- Content-based (choose ONE) -----
    # Option A: preference-based content
    content_recs = recommend_by_preferences(
        df_features,
        top_n=50,
        place_category="beach",
        interest="nature",
        crowd_level="low",
        best_season_to_visit="winter",
    )

    # Option B: similar-to-place content
    # content_recs = recommend_similar_to_destination(df_features, destination_name="Goa", top_n=50)

    # Ensure item_id exists in content features; if not, merge it from places_df using destination+city+state
    if "item_id" not in content_recs.columns:
        # best effort join
        join_cols = [c for c in ["popular_destination", "city", "state"] if c in content_recs.columns and c in places_df.columns]
        if join_cols:
            content_recs = content_recs.merge(places_df[["item_id"] + join_cols], on=join_cols, how="left")
        else:
            raise ValueError("Content recs missing item_id and cannot join to places.")

    # ----- Collaborative filtering -----
    cf_recs = recommend_for_user_userbased(
        ratings_df=ratings_df,
        places_df=places_df,
        target_user_id=demo_user,
        top_n=50,
        k_neighbors=15
    )

    # ----- Hybrid merge -----
    hybrid = hybrid_merge_and_rank(
        content_df=content_recs,
        cf_df=cf_recs,
        alpha=0.6,   # 60% content, 40% collaborative
        top_n=20
    )

    out_file = OUT_DIR / "hybrid_recommendations.csv"
    hybrid.to_csv(out_file, index=False)

    print("✅ Hybrid recommendations saved to:", out_file)
    print(hybrid.head(10))


if __name__ == "__main__":
    main()
