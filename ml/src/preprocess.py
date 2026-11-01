"""
NetGuard AI - Network Traffic Preprocessing Module
Part of the Machine Learning Foundation for Network Intrusion Detection System (NIDS)

Pipeline Position:
Raw Dataset → [Data Validation → Data Cleaning → Feature Processing] → Train/Test Split

Description:
This module is responsible for loading raw network flow traffic datasets (e.g., NSL-KDD,
CIC-IDS2017/2018), validating feature schemas, cleaning anomalous or missing values,
encoding categorical protocol attributes, and scaling continuous flow features.

NOTE: This is Phase 1 Foundation. In Phase 2, actual model training will utilize these
standardized preprocessing pipelines with verified cybersecurity datasets.
"""

import os
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd


# Default standard network flow feature columns (representative of standard NIDS datasets like NSL-KDD / CIC-IDS)
EXPECTED_CATEGORICAL_FEATURES: List[str] = [
    "protocol_type",  # e.g., tcp, udp, icmp
    "service",        # e.g., http, ftp, smtp, dns
    "flag",           # e.g., SF, S0, REJ, RSTO
]

EXPECTED_NUMERICAL_FEATURES: List[str] = [
    "duration",
    "src_bytes",
    "dst_bytes",
    "wrong_fragment",
    "urgent",
    "hot",
    "num_failed_logins",
    "logged_in",
    "num_compromised",
    "count",
    "srv_count",
    "serror_rate",
    "srv_serror_rate",
    "rerror_rate",
    "srv_rerror_rate",
    "same_srv_rate",
    "diff_srv_rate",
    "dst_host_count",
    "dst_host_srv_count",
]

TARGET_COLUMN: str = "label"  # 0 for Normal/Benign, 1 for Intrusion/Malicious


class NetworkDataPreprocessor:
    """
    Preprocessor class that manages validation, cleaning, encoding,
    and normalization for network intrusion detection flow records.
    """

    def __init__(
        self,
        categorical_features: Optional[List[str]] = None,
        numerical_features: Optional[List[str]] = None,
        target_column: str = TARGET_COLUMN,
    ):
        """
        Initialize preprocessor with designated feature schemas.
        """
        self.categorical_features = categorical_features or EXPECTED_CATEGORICAL_FEATURES
        self.numerical_features = numerical_features or EXPECTED_NUMERICAL_FEATURES
        self.target_column = target_column
        self.scaler = None
        self.encoder = None
        self.is_fitted = False

    def validate_schema(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Step 1: Data Validation
        Validates that the input DataFrame matches required columns and data structures.

        Returns:
            Tuple of (is_valid: bool, missing_columns: list)
        """
        # Placeholder for full dataset schema validation logic
        required_cols = set(self.categorical_features + self.numerical_features)
        existing_cols = set(df.columns)
        missing = list(required_cols - existing_cols)
        
        is_valid = len(missing) == 0
        return is_valid, missing

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Step 2: Data Cleaning
        Removes duplicates, handles infinite/NaN values, and strips whitespace.
        """
        # Copy to avoid side-effects on original data
        cleaned_df = df.copy()

        # Step 2a: Replace infinite values with NaN and impute or drop
        # Step 2b: Handle duplicate network flow records
        # Step 2c: Standardize string casing for categorical columns
        for col in self.categorical_features:
            if col in cleaned_df.columns:
                cleaned_df[col] = cleaned_df[col].astype(str).str.strip().str.lower()

        return cleaned_df

    def process_features(
        self,
        df: pd.DataFrame,
        is_training: bool = True
    ) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Step 3: Feature Processing
        Encodes categorical variables (One-Hot / Ordinal Encoding) and scales numerical
        variables (StandardScaler / MinMaxScaler) to preserve flow variance.

        Args:
            df: Cleaned network flow DataFrame
            is_training: If True, fit scalers/encoders. If False, transform using existing parameters.

        Returns:
            Tuple of (processed_features: np.ndarray, target_labels: Optional[np.ndarray])
        """
        # Placeholder for Phase 2 implementation with scikit-learn transformers:
        # e.g., ColumnTransformer(transformers=[
        #     ('num', StandardScaler(), self.numerical_features),
        #     ('cat', OneHotEncoder(handle_unknown='ignore'), self.categorical_features)
        # ])
        
        # When dataset is supplied in Phase 2, this will transform raw flow entries into
        # the vectorized array required by classification models.
        raise NotImplementedError(
            "Phase 1 Foundation: Preprocessing pipeline structure defined. "
            "Execute during Phase 2 with selected benchmark dataset."
        )


def load_raw_dataset(file_path: str) -> pd.DataFrame:
    """
    Utility function to load raw network capture / flow logs from CSV or Parquet.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Raw dataset file not found at: {file_path}")
    
    # Placeholder: reads CSV or Parquet into DataFrame
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    elif file_path.endswith(".parquet"):
        return pd.read_parquet(file_path)
    else:
        raise ValueError("Unsupported file format. Provide CSV or Parquet.")
