from src.config import FEATURES_CSV, REPORTS_DIR
from src.recommenders.content_based import (
    load_features,
    recommend_similar_to_destination,
    recommend_by_preferences
)


def main():

    df_features = load_features(str(FEATURES_CSV))

    out_dir = REPORTS_DIR / "recommendations"
    out_dir.mkdir(parents=True, exist_ok=True)

    # ---------------------------------
    # 1) Preference-based demo
    # ---------------------------------
    pref_recs = recommend_by_preferences(
        df_features,
        top_n=10,
        place_category="beach",
        interest="nature",
        crowd_level="low",
        best_season_to_visit="winter",
        prefer_budget="low",
        prefer_rating="high",
        prefer_popularity="medium"
    )

    # ---------------------------------
    # 2) Similar-to-place demo
    # ---------------------------------
    similar_recs = recommend_similar_to_destination(
        df_features,
        destination_name="Goa",
        top_n=10
    )

    # ---------------------------------
    # Save output
    # ---------------------------------
    pref_recs["mode"] = "preference_based"
    similar_recs["mode"] = "similar_to_place"

    final = pref_recs._append(similar_recs, ignore_index=True)

    out_file = out_dir / "content_based_recommendations.csv"
    final.to_csv(out_file, index=False)

    print("✅ Recommendations generated successfully!")
    print("Saved to:", out_file)

    print("\n--- Preference Based (Top 5) ---")
    print(pref_recs.head())

    print("\n--- Similar to Place (Top 5) ---")
    print(similar_recs.head())


if __name__ == "__main__":
    main()
