from flask import Flask, request, jsonify, make_response
import pandas as pd
from pathlib import Path

from src.config import FEATURES_CSV

# Content-based
from src.recommenders.content_based import (
    load_features,
    recommend_by_preferences,
    recommend_similar_to_destination
)

# Collaborative
from src.recommenders.collaborative import (
    load_ratings,
    load_places,
    recommend_for_user_userbased,
    get_available_users
)

# Hybrid
from src.recommenders.hybrid import hybrid_merge_and_rank


# -------------------------------------------------
# App
# -------------------------------------------------
app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    # Allow local development from typical React dev servers.
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# -------------------------------------------------
# Home
# -------------------------------------------------
@app.get("/")
def home():
    return """
    <h2>Travel Recommender API is running ✅</h2>
    <p>Try: <a href='/api/health'>/api/health</a></p>
    """


# -------------------------------------------------
# Load data once (on startup)
# -------------------------------------------------

# Content features
df_features = load_features(str(FEATURES_CSV))

# Base directory
BASE_DIR = Path(__file__).resolve().parents[1]

# CF data paths
RATINGS_CSV = BASE_DIR / "data" / "simulated" / "user_ratings.csv"
PLACES_CSV = BASE_DIR / "data" / "processed" / "places_clean_with_id.csv"

# Load CF datasets
ratings_df = load_ratings(str(RATINGS_CSV))
places_df = load_places(str(PLACES_CSV))

# Pick default user for demo
sample_users, _ = get_available_users(ratings_df, n=5)
DEFAULT_USER = sample_users[0]


# -------------------------------------------------
# Helpers
# -------------------------------------------------
def people_to_crowd_level(n: int) -> str:
    if n <= 2:
        return "low"
    if n <= 5:
        return "medium"
    return "high"


# -------------------------------------------------
# Health
# -------------------------------------------------
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# -------------------------------------------------
# Manual (Content-based)
# -------------------------------------------------
@app.post("/api/recommend/manual")
def recommend_manual():

    data = request.get_json(force=True)

    interest = data.get("interest", "")
    place_category = data.get("place_category", "")
    season = data.get("best_season_to_visit", "")
    state = data.get("state", "")
    people = int(data.get("people", 2))

    crowd_level = people_to_crowd_level(people)

    recs = recommend_by_preferences(
        df_features,
        top_n=int(data.get("top_n", 10)),
        place_category=place_category,
        interest=interest,
        crowd_level=crowd_level,
        best_season_to_visit=season,
        state=state,
        prefer_budget=data.get("prefer_budget", ""),
        prefer_rating=data.get("prefer_rating", ""),
        prefer_popularity=data.get("prefer_popularity", "")
    )

    return jsonify(recs.to_dict(orient="records"))


# -------------------------------------------------
# Similar Place
# -------------------------------------------------
@app.post("/api/recommend/similar")
def recommend_similar():

    data = request.get_json(force=True)

    destination = data.get("destination_name", "")
    top_n = int(data.get("top_n", 10))

    recs = recommend_similar_to_destination(
        df_features,
        destination_name=destination,
        top_n=top_n
    )

    return jsonify(recs.to_dict(orient="records"))


# -------------------------------------------------
# Hybrid Recommendation (NEW)
# -------------------------------------------------
@app.post("/api/recommend/hybrid")
def recommend_hybrid():

    data = request.get_json(force=True)

    # Preferences
    interest = data.get("interest", "")
    place_category = data.get("place_category", "")
    season = data.get("best_season_to_visit", "")
    people = int(data.get("people", 2))

    top_n = int(data.get("top_n", 10))
    alpha = float(data.get("alpha", 0.6))

    user_id = data.get("user_id", DEFAULT_USER)

    crowd_level = people_to_crowd_level(people)

    # ----------------------------
    # Content-based part
    # ----------------------------
    content_recs = recommend_by_preferences(
        df_features,
        top_n=50,
        place_category=place_category,
        interest=interest,
        crowd_level=crowd_level,
        best_season_to_visit=season
    )

    # Attach item_id if missing
    if "item_id" not in content_recs.columns:

        join_cols = [
            c for c in ["popular_destination", "city", "state"]
            if c in content_recs.columns and c in places_df.columns
        ]

        if join_cols:
            content_recs = content_recs.merge(
                places_df[["item_id"] + join_cols],
                on=join_cols,
                how="left"
            )

    # ----------------------------
    # Collaborative part
    # ----------------------------
    cf_recs = recommend_for_user_userbased(
        ratings_df=ratings_df,
        places_df=places_df,
        target_user_id=user_id,
        top_n=50,
        k_neighbors=15
    )

    # ----------------------------
    # Hybrid merge
    # ----------------------------
    hybrid = hybrid_merge_and_rank(
        content_df=content_recs,
        cf_df=cf_recs,
        alpha=alpha,
        top_n=top_n
    )

    return jsonify(hybrid.to_dict(orient="records"))


    data = request.get_json(force=True)

    # Preferences
    interest = data.get("interest", "")
    place_category = data.get("place_category", "")
    season = data.get("best_season_to_visit", "")
    people = int(data.get("people", 2))

    top_n = int(data.get("top_n", 10))
    alpha = float(data.get("alpha", 0.6))

    user_id = data.get("user_id", DEFAULT_USER)

    crowd_level = people_to_crowd_level(people)

    # ----------------------------
    # Content-based part
    # ----------------------------
    content_recs = recommend_by_preferences(
        df_features,
        top_n=50,
        place_category=place_category,
        interest=interest,
        crowd_level=crowd_level,
        best_season_to_visit=season
    )

    # Attach item_id if missing
    if "item_id" not in content_recs.columns:

        join_cols = [
            c for c in ["popular_destination", "city", "state"]
            if c in content_recs.columns and c in places_df.columns
        ]

        if join_cols:
            content_recs = content_recs.merge(
                places_df[["item_id"] + join_cols],
                on=join_cols,
                how="left"
            )

    # ----------------------------
    # Collaborative part
    # ----------------------------
    cf_recs = recommend_for_user_userbased(
        ratings_df=ratings_df,
        places_df=places_df,
        target_user_id=user_id,
        top_n=50,
        k_neighbors=15
    )

    # ----------------------------
    # Hybrid merge
    # ----------------------------
    hybrid = hybrid_merge_and_rank(
        content_df=content_recs,
        cf_df=cf_recs,
        alpha=alpha,
        top_n=top_n
    )

    return jsonify(hybrid.to_dict(orient="records"))

@app.get("/api/routes")
def routes():
    return jsonify(sorted([str(r) for r in app.url_map.iter_rules()]))


# -------------------------------------------------
# Frontend contract (POST /recommend)
# -------------------------------------------------
def _map_destination_type(destination_type: str) -> str:
    dt = (destination_type or "").strip().lower()
    if dt in {"beaches", "beach"}:
        return "Beach"
    if dt in {"city", "urban"}:
        return "Urban"
    if dt in {"mountains", "mountain", "nature"}:
        return "Wildlife"
    # Fallback to Wildlife which is broadly compatible with "nature/mountains".
    return "Wildlife"


def _map_experience_to_interest(experience: str) -> str:
    exp = (experience or "").strip().lower()
    if exp == "adventure":
        return "Adventure & Outdoor Activities"
    if exp == "relaxation":
        return "Natural Landscapes & Wildlife"
    if exp == "cultural":
        return "Cultural & Heritage Sites"
    if exp == "shopping":
        return "Shopping & Markets"
    return ""


def _map_activity_to_interest(activity: str) -> str:
    act = (activity or "").strip().lower()
    if act == "trekking":
        return "Adventure & Outdoor Activities"
    if act == "swimming":
        # Matches interest columns containing the word "beach".
        return "Beach"
    if act == "sightseeing":
        return "Sightseeing & Exploration"
    if act == "nightlife":
        return "Cultural & Heritage Sites"
    return ""


def _map_climate_to_season(climate: str) -> str:
    c = (climate or "").strip().lower()
    if c == "cold":
        return "November to April"
    if c == "moderate":
        return "October to March"
    if c == "hot":
        # Dataset only contains two season buckets; reuse the moderate bucket.
        return "October to March"
    return "October to March"


def _map_group_to_people(group: str) -> int:
    g = (group or "").strip().lower()
    if g == "solo":
        return 1
    if g == "couple":
        return 2
    if g == "family":
        return 6
    if g == "friends":
        return 4
    return 2


def _serialize_destination_row(r, budget_hint: str = ""):
    name = r.get("popular_destination") or ""
    return {
        "id": r.get("item_id"),
        "name": name,
        "description": r.get("synthetic_review") or "",
        "budget": budget_hint or "",
        "rating": r.get("google_rating"),
        "bestTimeToVisit": r.get("best_season_to_visit") or "",
        "city": r.get("city") or "",
        "state": r.get("state") or "",
        "placeCategory": r.get("place_category") or "",
        "interest": r.get("interest") or "",
        "priceFare": r.get("price_fare"),
        "crowdLevel": r.get("crowd_level") or "",
        "image": r.get("image") or None,
    }


@app.post("/recommend")
def recommend():
    """
    Contract endpoint used by the React app.

    Expected JSON:
    {
      "destination_type": "mountain|beaches|city|nature",
      "budget": "low|medium|high",
      "experience": "adventure|relaxation|cultural|shopping",
      "climate": "cold|moderate|hot",
      "duration": "short|medium|long",
      "group": "solo|friends|family|couple",
      "activity": "trekking|swimming|sightseeing|nightlife",
      "user_id": "optional"
    }
    """
    data = request.get_json(force=True) or {}

    destination_type = data.get("destination_type", "")
    budget = data.get("budget", "")
    experience = data.get("experience", "")
    climate = data.get("climate", "")
    duration = data.get("duration", "")  # currently unused by the model
    group = data.get("group", "")
    activity = data.get("activity", "")
    user_id = data.get("user_id", DEFAULT_USER)

    # Map UI answers to the model's feature space.
    place_category = _map_destination_type(destination_type)
    season = _map_climate_to_season(climate)
    crowd_level = people_to_crowd_level(_map_group_to_people(group))

    interest = _map_experience_to_interest(experience)
    if not interest:
        interest = _map_activity_to_interest(activity)
    # If both are set, prefer the "experience" choice (more stable in features).
    if not interest:
        interest = _map_activity_to_interest(activity)

    top_n = int(data.get("top_n", 10))
    alpha = float(data.get("alpha", 0.6))

    # ----------------------------
    # Content-based part
    # ----------------------------
    content_recs = recommend_by_preferences(
        df_features,
        top_n=50,
        place_category=place_category,
        interest=interest,
        crowd_level=crowd_level,
        best_season_to_visit=season,
        prefer_budget=budget,
    )

    # ----------------------------
    # Collaborative part
    # ----------------------------
    cf_recs = recommend_for_user_userbased(
        ratings_df=ratings_df,
        places_df=places_df,
        target_user_id=user_id,
        top_n=50,
        k_neighbors=15,
    )

    # ----------------------------
    # Hybrid merge
    # ----------------------------
    hybrid = hybrid_merge_and_rank(
        content_df=content_recs,
        cf_df=cf_recs,
        alpha=alpha,
        top_n=top_n,
    )

    # Attach display fields that aren't included in the content meta set.
    display_cols = ["item_id", "google_rating", "price_fare", "best_season_to_visit"]
    display_cols = [c for c in display_cols if c in places_df.columns]
    if display_cols:
        hybrid = hybrid.merge(places_df[display_cols], on="item_id", how="left")

    # Final payload shape for the frontend.
    hybrid_records = hybrid.to_dict(orient="records")
    out = []
    for r in hybrid_records:
        row = _serialize_destination_row(r, budget_hint=budget or "")
        if not row.get("bestTimeToVisit"):
            row["bestTimeToVisit"] = season
        out.append(row)

    resp = make_response(jsonify(out))
    return resp


@app.route("/recommend", methods=["OPTIONS"])
def recommend_options():
    # Enables CORS preflight for browsers.
    return ("", 204)


@app.get("/destinations")
def get_destinations():
    # Return all destinations for browse/discovery pages.
    limit = request.args.get("limit", default=60, type=int)
    offset = request.args.get("offset", default=0, type=int)
    limit = max(1, min(limit, 2000))
    offset = max(0, offset)

    df = places_df
    # Pandas row slicing is zero-based; use iloc for offset/limit.
    if offset or limit:
        df = df.iloc[offset : offset + limit]

    records = df.to_dict(orient="records")
    out = [_serialize_destination_row(r) for r in records]
    return jsonify(out)


@app.get("/destination/<int:item_id>")
def get_destination(item_id: int):
    match = places_df[places_df["item_id"] == item_id]
    if match.empty:
        return jsonify({"error": "Destination not found"}), 404
    row = match.iloc[0].to_dict()
    return jsonify(_serialize_destination_row(row))
