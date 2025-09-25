import sys
import json
import os
import pandas as pd
import numpy as np
import joblib
from datetime import datetime

# XGBoost import
try:
    import xgboost as xgb
except ImportError:
    xgb = None

# Prophet import
try:
    from prophet import Prophet
except Exception:
    try:
        from fbprophet import Prophet
    except Exception:
        Prophet = None


def coerce_numeric_columns(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    """Clean and convert columns to numeric"""
    for column_name in columns:
        df[column_name] = (
            df[column_name]
            .astype(str)
            .str.replace(r"[^\d.\-]", "", regex=True)
        )
        df[column_name] = pd.to_numeric(df[column_name], errors="coerce")
    return df


def compute_derived_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """Compute derived marketing metrics"""
    df = df.copy()
    df["CTR"] = (df["Clicks"] / df["Impressions"]).replace([np.inf, -np.inf], np.nan) * 100.0
    df["CPC"] = (df["Acquisition_Cost"] / df["Clicks"]).replace([np.inf, -np.inf], np.nan)
    df["ROAS"] = (df["ROI"] / df["Acquisition_Cost"]).replace([np.inf, -np.inf], np.nan)
    return df


def create_features(df, historical_df=None, target=None, cat_cols=None, date_col="Date"):
    """Create features for ML prediction"""
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
    if target and historical_df is not None:
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
        encoders_path = "categorical_encoders.joblib"
        if os.path.exists(encoders_path):
            encoders = joblib.load(encoders_path)
            for c in cat_cols:
                if c in df.columns:
                    df[c] = df[c].fillna("MISSING").astype(str)
                    freq = encoders.get(c, {})
                    df[f"{c}_freq"] = df[c].map(freq).fillna(0)

    # Fill numeric missing
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].ffill().bfill().fillna(0)

    return df.reset_index()


def predict_with_models(df_input: pd.DataFrame, target_metric: str) -> dict:
    """Make predictions using trained XGBoost and Prophet models"""
    cat_cols = ["Company", "Campaign_Type", "Channel_Used", "Target_Audience",
                "Location", "Language", "Customer_Segment"]

    # Load historical data for feature engineering
    historical_df = pd.read_csv('../marketing_campaign_dataset.csv', parse_dates=['Date'])

    # XGBoost prediction
    xgb_prediction = None
    if xgb is not None:
        xgb_model_path = f"xgb_model_{target_metric}.joblib"
        xgb_features_path = f"xgb_features_{target_metric}.joblib"

        if os.path.exists(xgb_model_path) and os.path.exists(xgb_features_path):
            try:
                xgb_model = joblib.load(xgb_model_path)
                xgb_features = joblib.load(xgb_features_path)

                df_feat = create_features(df_input.copy(), historical_df, target=target_metric, cat_cols=cat_cols)

                # Ensure all features exist
                for f in xgb_features:
                    if f not in df_feat.columns:
                        df_feat[f] = 0

                X = df_feat[xgb_features]
                xgb_preds = xgb_model.predict(X)

                # Apply inverse log transformation for count metrics
                if target_metric in ["Clicks", "Impressions"]:
                    xgb_preds = np.expm1(xgb_preds)

                xgb_prediction = float(xgb_preds[0]) if len(xgb_preds) > 0 else None
            except Exception as e:
                print(f"XGBoost prediction error: {e}", file=sys.stderr)

    # Prophet forecast
    prophet_prediction = None
    prophet_model_path = f"prophet_model_{target_metric}.joblib"

    if Prophet and os.path.exists(prophet_model_path):
        try:
            prophet_model = joblib.load(prophet_model_path)
            future = pd.DataFrame({"ds": pd.to_datetime(df_input["Date"])})
            forecast = prophet_model.predict(future)
            prophet_prediction = float(forecast["yhat"].values[0])
        except Exception as e:
            print(f"Prophet prediction error: {e}", file=sys.stderr)

    # Ensemble prediction (average of available models)
    predictions = [p for p in [xgb_prediction, prophet_prediction] if p is not None]
    final_prediction = np.mean(predictions) if predictions else None

    # Calculate confidence based on model agreement
    confidence = 0.5  # Default confidence
    if len(predictions) > 1:
        std_dev = np.std(predictions)
        mean_val = np.mean(predictions)
        confidence = max(0.1, 1.0 / (1.0 + (std_dev / (abs(mean_val) + 1e-6))))
    elif len(predictions) == 1:
        confidence = 0.7  # Single model confidence

    return {
        "prediction": final_prediction,
        "confidence": float(confidence),
        "xgb_prediction": xgb_prediction,
        "prophet_prediction": prophet_prediction,
        "models_used": len(predictions)
    }


def predict(payload: dict) -> dict:
    """Main prediction function"""
    try:
        # Load and prepare data
        df = pd.read_csv('../marketing_campaign_dataset.csv')
        df = coerce_numeric_columns(df, ["Clicks", "Impressions", "Acquisition_Cost", "ROI"])
        df = df.dropna(subset=["Clicks", "Impressions", "Acquisition_Cost", "ROI"]) \
               .query("Clicks != 0 and Impressions != 0 and Acquisition_Cost != 0")
        df = compute_derived_metrics(df)

        target_metric = payload.get("metric", "Clicks")
        horizon = int(payload.get("horizon", 1))

        if target_metric not in df.columns:
            return {"error": f"Unknown metric: {target_metric}", "available": sorted(df.columns.tolist())}

        # Get current value
        series = df[target_metric]
        current_value = float(series.tail(1).iloc[0]) if len(series) else None

        # Create input data for prediction (next day)
        last_date = pd.to_datetime(df['Date'].max())
        next_date = last_date + pd.Timedelta(days=1)

        df_input = pd.DataFrame({
            "Date": [next_date],
            "Company": [payload.get("company", "Unknown")],
            "Campaign_Type": [payload.get("campaign_type", "Email")],
            "Channel_Used": [payload.get("channel", "Social")],
            "Target_Audience": [payload.get("target_audience", "General")],
            "Location": [payload.get("location", "Global")],
            "Language": [payload.get("language", "English")],
            "Customer_Segment": [payload.get("customer_segment", "All")],
            target_metric: [np.nan]  # Will be predicted
        })

        # Make prediction
        prediction_result = predict_with_models(df_input, target_metric)

        # Get insights
        top_segments = (
            df.groupby("Channel_Used")["ROI"].mean().sort_values(ascending=False).head(5).reset_index()
        )

        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metric": target_metric,
            "horizon": horizon,
            "current": current_value,
            "prediction": prediction_result["prediction"],
            "confidence": prediction_result["confidence"],
            "xgb_prediction": prediction_result["xgb_prediction"],
            "prophet_prediction": prediction_result["prophet_prediction"],
            "models_used": prediction_result["models_used"],
            "insights": {
                "best_channels_by_roi": top_segments.to_dict(orient="records")
            }
        }

    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat() + "Z"}


def main():

    try:
        raw = sys.stdin.read().strip()
        payload = json.loads(raw) if raw else {}
    except Exception:
        payload = {}

    result = predict(payload)
    sys.stdout.write(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()


