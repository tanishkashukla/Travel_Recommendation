from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATA_RAW = PROJECT_ROOT / "data" / "raw" / "final_places_dataset.csv"
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
REPORTS_DIR = PROJECT_ROOT / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"

CLEAN_CSV = DATA_PROCESSED_DIR / "places_clean.csv"
FEATURES_CSV = DATA_PROCESSED_DIR / "places_features.csv"
SUMMARY_TXT = REPORTS_DIR / "dataset_summary.txt"

