"""
NetGuard AI - Network Traffic Preprocessing Module
Preprocessing pipeline for Network Intrusion Detection System (NIDS).

Pipeline Architecture:
Raw Dataset (NSL-KDD) -> Data Cleaning -> ColumnTransformer (Imputer + StandardScaler + OneHotEncoder)
"""

import os
from typing import List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Categorical flow attributes
CATEGORICAL_FEATURES: List[str] = [
    "protocol_type",  # tcp, udp, icmp
    "service",        # http, smtp, ftp, dns, private, etc.
    "flag",           # SF, S0, REJ, RSTO, etc.
]

# Continuous and discrete numerical traffic attributes
NUMERICAL_FEATURES: List[str] = [
    "duration",
    "src_bytes",
    "dst_bytes",
    "land",
    "wrong_fragment",
    "urgent",
    "hot",
    "num_failed_logins",
    "logged_in",
    "num_compromised",
    "root_shell",
    "su_attempted",
    "num_root",
    "num_file_creations",
    "num_shells",
    "num_access_files",
    "num_outbound_cmds",
    "is_host_login",
    "is_guest_login",
    "count",
    "srv_count",
    "serror_rate",
    "srv_serror_rate",
    "rerror_rate",
    "srv_rerror_rate",
    "same_srv_rate",
    "diff_srv_rate",
    "srv_diff_host_rate",
    "dst_host_count",
    "dst_host_srv_count",
    "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate",
    "dst_host_srv_serror_rate",
    "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate",
]

# The 41 feature columns expected in network flow logs
ALL_FEATURE_COLUMNS: List[str] = [
    "duration", "protocol_type", "service", "flag", "src_bytes",
    "dst_bytes", "land", "wrong_fragment", "urgent", "hot",
    "num_failed_logins", "logged_in", "num_compromised", "root_shell",
    "su_attempted", "num_root", "num_file_creations", "num_shells",
    "num_access_files", "num_outbound_cmds", "is_host_login",
    "is_guest_login", "count", "srv_count", "serror_rate",
    "srv_serror_rate", "rerror_rate", "srv_rerror_rate", "same_srv_rate",
    "diff_srv_rate", "srv_diff_host_rate", "dst_host_count",
    "dst_host_srv_count", "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate", "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate"
]

TARGET_COLUMN: str = "label"

# Attack Category taxonomies present in NSL-KDD
ATTACK_TYPES = {
    "dos": ["neptune", "smurf", "pod", "teardrop", "back", "land", "apache2", "udpstorm", "processtable", "mailbomb"],
    "probe": ["ipsweep", "satan", "portsweep", "nmap", "saint", "mscan"],
    "r2l": ["warezclient", "guess_passwd", "warezmaster", "imap", "phf", "multihop", "ftp_write", "spy", "xlock", "xsnoop", "snmpguess", "snmpgetattack", "httptunnel", "sendmail", "named"],
    "u2r": ["buffer_overflow", "rootkit", "loadmodule", "perl", "sqlattack", "xterm", "ps"]
}


def clean_dataframe(df: pd.DataFrame, drop_duplicates: bool = False) -> pd.DataFrame:
    """
    Cleans raw network flow records:
    - Standardizes column headers (trimmed, lowercase)
    - Strips leading/trailing whitespace on string attributes
    - Standardizes categorical casing
    - Converts infinite values (inf, -inf) to NaN
    - Ensures numerical columns are numeric
    - Optionally removes exact duplicates (for training set)
    """
    cleaned = df.copy()

    # Standardize column headers to lowercase and strip whitespace
    cleaned.columns = [str(c).strip().lower() for c in cleaned.columns]

    if drop_duplicates:
        cleaned = cleaned.drop_duplicates()

    # Clean categorical string columns
    for col in CATEGORICAL_FEATURES:
        if col in cleaned.columns:
            cleaned[col] = cleaned[col].astype(str).str.strip().str.lower()

    # Clean numeric columns
    for col in NUMERICAL_FEATURES:
        if col in cleaned.columns:
            cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")
            cleaned[col] = cleaned[col].replace([np.inf, -np.inf], np.nan)

    return cleaned


def create_preprocessor() -> ColumnTransformer:
    """
    Builds the scikit-learn ColumnTransformer pipeline for features.
    - Numerical: SimpleImputer(median) + StandardScaler()
    - Categorical: SimpleImputer(constant 'other') + OneHotEncoder(ignore unknown)
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="other")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    return preprocessor


def extract_features_and_target(
    df: pd.DataFrame
) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
    """
    Extracts the 41 feature columns and maps the target label to binary:
    - 0: Normal / Benign
    - 1: Potential Intrusion / Malicious
    """
    # Standardize column lookup map
    df_cols_map = {str(c).strip().lower(): c for c in df.columns}

    # Check if target column exists
    target_series = None
    target_col_lower = TARGET_COLUMN.lower()
    if target_col_lower in df_cols_map:
        original_col = df_cols_map[target_col_lower]
        labels = df[original_col].astype(str).str.strip().str.lower()
        # Binary target: 0 for normal, 1 for any attack category
        target_series = (labels != "normal").astype(int)

    # Align features: fill any missing expected features with 0 / 'other'
    features_df = pd.DataFrame(index=df.index)
    for col in ALL_FEATURE_COLUMNS:
        col_lower = col.lower()
        if col_lower in df_cols_map:
            features_df[col] = df[df_cols_map[col_lower]]
        else:
            if col in CATEGORICAL_FEATURES:
                features_df[col] = "other"
            else:
                features_df[col] = 0.0

    return features_df, target_series


def load_nsl_kdd_raw(
    file_path: str,
    has_difficulty: bool = True
) -> pd.DataFrame:
    """
    Loads raw NSL-KDD text file and assigns standard column headers.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found: {file_path}")

    col_names = ALL_FEATURE_COLUMNS + [TARGET_COLUMN]
    if has_difficulty:
        col_names.append("difficulty_level")

    df = pd.read_csv(file_path, names=col_names, header=None)
    return df
