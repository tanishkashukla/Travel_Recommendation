from src.config import DATA_RAW, DATA_PROCESSED_DIR, CLEAN_CSV, FEATURES_CSV, REPORTS_DIR, SUMMARY_TXT
from src.data.preprocess import load_raw, basic_clean, build_features, write_summary

def main():
    DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    df = load_raw(str(DATA_RAW))
    df_clean = basic_clean(df)
    df_features = build_features(df_clean)

    df_clean.to_csv(CLEAN_CSV, index=False)
    df_features.to_csv(FEATURES_CSV, index=False)

    summary = write_summary(df_clean)
    SUMMARY_TXT.write_text(summary, encoding="utf-8")

    print(" Preprocessing complete!")
    print(f"Saved clean dataset  -> {CLEAN_CSV}")
    print(f"Saved features table -> {FEATURES_CSV}")
    print(f"Saved summary        -> {SUMMARY_TXT}")

if __name__ == "__main__":
    main()
