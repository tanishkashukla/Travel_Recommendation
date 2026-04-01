print("RUN_EDA.PY STARTED ")

import pandas as pd
from src.config import CLEAN_CSV, FIGURES_DIR

from src.eda.eda_plots import (
    plot_best_season_distribution,
    plot_crowd_level_distribution,
    plot_rating_distribution,

    plot_avg_rating_by_category,
    plot_avg_rating_by_state,
    plot_avg_rating_by_crowd_level,

    plot_best_season_by_category,
    plot_best_season_by_state,

    plot_crowd_level_by_city,
    plot_avg_price_by_category
)

def main():
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(CLEAN_CSV)

    # Base
    plot_best_season_distribution(df, FIGURES_DIR / "01_best_season_distribution.png")
    plot_crowd_level_distribution(df, FIGURES_DIR / "02_crowd_level_distribution.png")
    plot_rating_distribution(df, FIGURES_DIR / "03_rating_distribution.png")

    # Specific graphs you asked for
    plot_avg_rating_by_category(df, FIGURES_DIR / "04_avg_rating_by_category.png")
    plot_avg_rating_by_state(df, FIGURES_DIR / "05_avg_rating_by_state.png")
    plot_avg_rating_by_crowd_level(df, FIGURES_DIR / "06_avg_rating_by_crowd_level.png")

    plot_best_season_by_category(df, FIGURES_DIR / "07_best_season_by_category.png")
    plot_best_season_by_state(df, FIGURES_DIR / "08_best_season_by_state.png")

    plot_crowd_level_by_city(df, FIGURES_DIR / "09_crowd_level_by_city.png")
    plot_avg_price_by_category(df, FIGURES_DIR / "10_avg_price_by_category.png")

    print(" Specific EDA plots saved to:", FIGURES_DIR)

if __name__ == "__main__":
    main()

