
import pandas as pd
import numpy as np
import io
import contextlib
import json
import sys
import traceback

try:
    # Load dataset
    df = pd.read_csv('marketing_campaign_dataset.csv')

    # Clean numeric columns
    for col in ["Clicks", "Impressions", "Acquisition_Cost", "ROI"]:
        df[col] = df[col].astype(str).str.replace(r"[^d.]", "", regex=True)
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["Clicks", "Impressions", "Acquisition_Cost", "ROI"])
    df = df[(df["Clicks"] != 0) & (df["Impressions"] != 0) & (df["Acquisition_Cost"] != 0)]

    # Compute metrics
    df["CTR"] = (df["Clicks"] / df["Impressions"]) * 100
    df["CPC"] = df["Acquisition_Cost"] / df["Clicks"]
    df["ROAS"] = df["ROI"] / df["Acquisition_Cost"]

    # Execute generated code
    result = df.groupby('Company')['ROI'].mean().nlargest(5)

    def _to_json_serializable(o):
        try:
            if isinstance(o, pd.DataFrame):
                return o.to_dict(orient='records')
            if isinstance(o, pd.Series):
                return o.to_dict()
            if isinstance(o, (np.integer,)):
                return int(o)
            if isinstance(o, (np.floating,)):
                return float(o)
            import numpy as _np
            if isinstance(o, (_np.ndarray,)):
                return o.tolist()
            return o
        except Exception:
            return str(o)

    print(json.dumps({"result": _to_json_serializable(result)}, ensure_ascii=False))

except Exception as e:
    error_msg = f"Python execution error: {str(e)}\nTraceback: {traceback.format_exc()}"
    print(json.dumps({"error": error_msg}, ensure_ascii=False))
    sys.exit(1)
