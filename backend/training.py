# predict_models_menu_interactive.py
import os
import pandas as pd
import numpy as np
import joblib
import xgboost as xgb

# Prophet import
try:
    from prophet import Prophet
except Exception:
    try:
        from fbprophet import Prophet
    except Exception:
        Prophet = None

# -------------------------
# CONFIG
# -------------------------
MODELS_DIR = os.path.join("archive_new", "models_trained")
DATE_COL = "Date"
TARGETS = ["ROI", "Clicks", "Impressions"]

# -------------------------
# Load inference artifacts
# -------------------------
def load_artifacts():
    encoders_path = os.path.join(MODELS_DIR, "categorical_encoders.joblib")
    encoders = joblib.load(encoders_path) if os.path.exists(encoders_path) else {}

    historical_path = os.path.join(MODELS_DIR, "historical_data.csv")
    historical_df = pd.read_csv(historical_path, parse_dates=[DATE_COL]) if os.path.exists(historical_path) else pd.DataFrame()

    return encoders, historical_df

# -------------------------
# Feature engineering
# -------------------------
def create_features(df, historical_df=None, target=None, cat_cols=None, date_col=DATE_COL):
    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(date_col).set_index(date_col)

    # Time features
    df["day_of_week"] = df.index.dayofweek
    df["week"] = df.index.isocalendar().week.astype(int)
    df["month"] = df.index.month
    df["quarter"] = df.index.quarter
    df["day"] = df.index.day
    df["year"] = df.index.year
    df["is_month_start"] = df.index.is_month_start.astype(int)
    df["is_month_end"] = df.index.is_month_end.astype(int)

    # Use historical + new data for lags/rolling
    if target:
        hist_target = historical_df[[date_col, target]].set_index(date_col) if target in historical_df.columns else pd.DataFrame(columns=[target])
        current_target = df[[target]] if target in df.columns else pd.DataFrame(columns=[target])
        combined = pd.concat([hist_target, current_target], axis=0)

        lags = [1, 7, 14, 30]
        rolls = [7, 14, 30]

        for lag in lags:
            shifted = combined[target].shift(lag).reset_index(drop=True)
            df[f"{target}_lag_{lag}"] = shifted[-len(df):].values

        for r in rolls:
            roll_mean = combined[target].shift(1).rolling(r).mean().reset_index(drop=True)
            roll_std = combined[target].shift(1).rolling(r).std().reset_index(drop=True)
            df[f"{target}_roll_mean_{r}"] = roll_mean[-len(df):].values
            df[f"{target}_roll_std_{r}"] = roll_std[-len(df):].values

    # Frequency encoding for categorical columns
    if cat_cols:
        encoders, _ = load_artifacts()
        for c in cat_cols:
            if c in df.columns:
                df[c] = df[c].fillna("MISSING").astype(str)
                freq = encoders.get(c, {})
                df[f"{c}_freq"] = df[c].map(freq).fillna(0)

    # Fill numeric missing
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].ffill().bfill().fillna(0)

    return df.reset_index()

# -------------------------
# XGBoost Prediction
# -------------------------
def predict_xgb(df_input):
    encoders, historical_df = load_artifacts()
    cat_cols = ["Company", "Campaign_Type", "Channel_Used", "Target_Audience",
                "Location", "Language", "Customer_Segment"]

    results = df_input.copy()

    for target in TARGETS:
        xgb_path = os.path.join(MODELS_DIR, f"xgb_model_{target}.joblib")
        features_path = os.path.join(MODELS_DIR, f"xgb_features_{target}.joblib")
        if not os.path.exists(xgb_path) or not os.path.exists(features_path):
            print(f"⚠ XGBoost model or features for {target} not found. Skipping.")
            continue

        model = joblib.load(xgb_path)
        features = joblib.load(features_path)

        df_feat = create_features(df_input, historical_df, target=target, cat_cols=cat_cols)

        # Ensure all features exist
        for f in features:
            if f not in df_feat.columns:
                df_feat[f] = 0

        X = df_feat[features]
        do_log = target in ["Clicks", "Impressions"]
        preds = model.predict(X)
        if do_log:
            preds = np.expm1(preds)

        results[f"{target}_pred"] = preds

    print("\n📊 XGBoost Predictions:\n", results[[DATE_COL] + [f"{t}_pred" for t in TARGETS if f"{t}_pred" in results.columns]])
    return results

# -------------------------
# Prophet Forecast
# -------------------------
def forecast_prophet(df_input):
    results = df_input.copy()
    for target in TARGETS:
        prophet_path = os.path.join(MODELS_DIR, f"prophet_model_{target}.joblib")
        if Prophet and os.path.exists(prophet_path):
            try:
                prophet_model = joblib.load(prophet_path)
                future = pd.DataFrame({"ds": pd.to_datetime(df_input[DATE_COL])})
                forecast = prophet_model.predict(future)
                results[f"{target}_prophet"] = forecast["yhat"].values
            except Exception as e:
                print(f"⚠ Prophet forecast failed for {target}:", e)
        else:
            print(f"⚠ Prophet model for {target} not found or Prophet not installed.")
    print("\n📊 Prophet Forecast:\n", results[[DATE_COL] + [f"{t}_prophet" for t in TARGETS if f"{t}_prophet" in results.columns]])
    return results

# -------------------------
# Interactive user input
# -------------------------
def get_user_input():
    print("\nEnter campaign details:")
    company = input("Company: ").strip()
    campaign_type = input("Campaign Type (Email/Social/Search/Display/Affiliate): ").strip()
    target_audience = input("Target Audience: ").strip()
    channel_used = input("Channel Used: ").strip()
    start_date = input("Start Date (YYYY-MM-DD): ").strip()
    duration = int(input("Duration (days): ").strip())

    dates = pd.date_range(start=start_date, periods=duration)
    df = pd.DataFrame({
        "Date": dates,
        "Company": [company]*duration,
        "Campaign_Type": [campaign_type]*duration,
        "Channel_Used": [channel_used]*duration,
        "Target_Audience": [target_audience]*duration,
        "Location": [np.nan]*duration,
        "Language": [np.nan]*duration,
        "Customer_Segment": [np.nan]*duration,
        "ROI": [np.nan]*duration,
        "Clicks": [np.nan]*duration,
        "Impressions": [np.nan]*duration,
        "Conversion_Rate": [np.nan]*duration,
        "Acquisition_Cost": [np.nan]*duration,
        "Engagement_Score": [np.nan]*duration
    })
    return df

# -------------------------
# Menu
# -------------------------
def menu():
    while True:
        print("\n📌 Select an option:")
        print("1. Predict values (XGBoost, user input)")
        print("2. Forecast future (Prophet)")
        print("3. Exit")
        choice = input("Enter your choice [1-3]: ").strip()

        if choice == "1":
            df_input = get_user_input()
            predict_xgb(df_input)
        elif choice == "2":
            df_input = get_user_input()[["Date"]]  # Only need dates for Prophet
            forecast_prophet(df_input)
        elif choice == "3":
            print("Exiting... 👋")
            break
        else:
            print("⚠ Invalid choice. Please select 1, 2, or 3.")

# -------------------------
# Main
# -------------------------
if __name__ == "__main__":
    menu()
