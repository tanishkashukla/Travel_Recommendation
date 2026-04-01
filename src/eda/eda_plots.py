import matplotlib.pyplot as plt
import pandas as pd

def save_fig(path):
    plt.tight_layout()
    plt.savefig(path, dpi=220)
    plt.close()

def _exists(df, cols):
    return all(c in df.columns for c in cols)

# ---------- BASIC DISTRIBUTIONS ----------
def plot_best_season_distribution(df, outpath):
    if "best_season_to_visit" not in df.columns: return
    df["best_season_to_visit"].value_counts().plot(kind="bar")
    plt.title("Best Season to Visit Distribution")
    plt.xlabel("Best Season to Visit")
    plt.ylabel("Count")
    save_fig(outpath)

def plot_crowd_level_distribution(df, outpath):
    if "crowd_level" not in df.columns: return
    df["crowd_level"].value_counts().plot(kind="bar")
    plt.title("Crowd Level Distribution")
    plt.xlabel("Crowd Level")
    plt.ylabel("Count")
    save_fig(outpath)

def plot_rating_distribution(df, outpath):
    if "google_rating" not in df.columns: return
    df["google_rating"].dropna().plot(kind="hist", bins=12)
    plt.title("Google Rating Distribution")
    plt.xlabel("Google Rating")
    plt.ylabel("Frequency")
    save_fig(outpath)

# ---------- SPECIFIC EDA (WHAT YOU ASKED) ----------
def plot_avg_rating_by_category(df, outpath, top_n=15):
    if not _exists(df, ["place_category", "google_rating"]): return
    d = df.groupby("place_category")["google_rating"].mean().sort_values(ascending=False).head(top_n)
    d.plot(kind="bar")
    plt.title(f"Average Google Rating by Place Category (Top {top_n})")
    plt.xlabel("Place Category")
    plt.ylabel("Avg Google Rating")
    save_fig(outpath)

def plot_avg_rating_by_state(df, outpath, top_n=12):
    if not _exists(df, ["state", "google_rating"]): return
    d = df.groupby("state")["google_rating"].mean().sort_values(ascending=False).head(top_n)
    d.plot(kind="bar")
    plt.title(f"Average Google Rating by State (Top {top_n})")
    plt.xlabel("State")
    plt.ylabel("Avg Google Rating")
    save_fig(outpath)

def plot_avg_rating_by_crowd_level(df, outpath):
    if not _exists(df, ["crowd_level", "google_rating"]): return
    d = df.groupby("crowd_level")["google_rating"].mean().sort_values(ascending=False)
    d.plot(kind="bar")
    plt.title("Average Google Rating by Crowd Level")
    plt.xlabel("Crowd Level")
    plt.ylabel("Avg Google Rating")
    save_fig(outpath)

def plot_best_season_by_category(df, outpath, top_categories=8):
    """
    Stacked-style count plot (no seaborn):
    For top categories, show counts of best seasons.
    """
    if not _exists(df, ["place_category", "best_season_to_visit"]): return

    top_cats = df["place_category"].value_counts().head(top_categories).index
    sub = df[df["place_category"].isin(top_cats)]

    pivot = pd.crosstab(sub["place_category"], sub["best_season_to_visit"])
    pivot.plot(kind="bar")
    plt.title(f"Best Season to Visit by Place Category (Top {top_categories} Categories)")
    plt.xlabel("Place Category")
    plt.ylabel("Count")
    plt.legend(title="Best Season", bbox_to_anchor=(1.02, 1), loc="upper left")
    save_fig(outpath)

def plot_best_season_by_state(df, outpath, top_states=8):
    if not _exists(df, ["state", "best_season_to_visit"]): return

    top_st = df["state"].value_counts().head(top_states).index
    sub = df[df["state"].isin(top_st)]

    pivot = pd.crosstab(sub["state"], sub["best_season_to_visit"])
    pivot.plot(kind="bar")
    plt.title(f"Best Season to Visit by State (Top {top_states} States)")
    plt.xlabel("State")
    plt.ylabel("Count")
    plt.legend(title="Best Season", bbox_to_anchor=(1.02, 1), loc="upper left")
    save_fig(outpath)

def plot_crowd_level_by_city(df, outpath, top_cities=10):
    """
    Crowd level distribution across top cities.
    """
    if not _exists(df, ["city", "crowd_level"]): return

    top_ct = df["city"].value_counts().head(top_cities).index
    sub = df[df["city"].isin(top_ct)]

    pivot = pd.crosstab(sub["city"], sub["crowd_level"])
    pivot.plot(kind="bar")
    plt.title(f"Crowd Level by City (Top {top_cities} Cities)")
    plt.xlabel("City")
    plt.ylabel("Count")
    plt.legend(title="Crowd Level", bbox_to_anchor=(1.02, 1), loc="upper left")
    save_fig(outpath)

def plot_avg_price_by_category(df, outpath, top_n=12):
    if not _exists(df, ["place_category", "price_fare"]): return
    d = df.groupby("place_category")["price_fare"].mean().sort_values(ascending=False).head(top_n)
    d.plot(kind="bar")
    plt.title(f"Average Price Fare by Category (Top {top_n})")
    plt.xlabel("Place Category")
    plt.ylabel("Avg Price Fare")
    save_fig(outpath)

