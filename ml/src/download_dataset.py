"""
NetGuard AI - Real Dataset Ingestion & Validation Script
Downloads and validates the official NSL-KDD benchmark dataset.
"""

import os
import urllib.request
import pandas as pd

COLUMN_NAMES = [
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
    "dst_host_srv_rerror_rate", "label", "difficulty_level"
]

DATA_URLS = {
    "KDDTrain+_20Percent.txt": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain%2B_20Percent.txt",
    "KDDTest+.txt": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTest%2B.txt"
}

def download_file(url: str, dest_path: str):
    print(f"Downloading from {url} to {dest_path}...")
    urllib.request.urlretrieve(url, dest_path)
    file_size_mb = os.path.getsize(dest_path) / (1024 * 1024)
    print(f"Downloaded successfully: {dest_path} ({file_size_mb:.2f} MB)")

def main():
    raw_dir = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)

    for filename, url in DATA_URLS.items():
        dest = os.path.join(raw_dir, filename)
        if not os.path.exists(dest) or os.path.getsize(dest) == 0:
            download_file(url, dest)
        else:
            print(f"File already exists: {dest}")

    # Inspect downloaded files
    train_path = os.path.join(raw_dir, "KDDTrain+_20Percent.txt")
    df_train = pd.read_csv(train_path, names=COLUMN_NAMES, header=None)
    
    test_path = os.path.join(raw_dir, "KDDTest+.txt")
    df_test = pd.read_csv(test_path, names=COLUMN_NAMES, header=None)

    print("\n" + "=" * 60)
    print("NSL-KDD Dataset Inspection Summary")
    print("=" * 60)
    print(f"Train Records (KDDTrain+_20Percent.txt): {len(df_train)}")
    print(f"Test Records (KDDTest+.txt): {len(df_test)}")
    print(f"Total Combined Records: {len(df_train) + len(df_test)}")
    print(f"Features (excluding label & difficulty): {len(COLUMN_NAMES) - 2}")
    
    print("\n--- Class Distribution in Training Set ---")
    train_counts = df_train['label'].value_counts()
    normal_train = train_counts.get('normal', 0)
    attack_train = len(df_train) - normal_train
    print(f"Normal (Benign): {normal_train} ({normal_train / len(df_train) * 100:.2f}%)")
    print(f"Intrusions (Malicious): {attack_train} ({attack_train / len(df_train) * 100:.2f}%)")
    print("\nTop 10 Attack Types in Training Set:")
    for label, count in train_counts.items():
        if label != 'normal':
            print(f"  - {label}: {count}")

    print("\n--- Class Distribution in Test Set ---")
    test_counts = df_test['label'].value_counts()
    normal_test = test_counts.get('normal', 0)
    attack_test = len(df_test) - normal_test
    print(f"Normal (Benign): {normal_test} ({normal_test / len(df_test) * 100:.2f}%)")
    print(f"Intrusions (Malicious): {attack_test} ({attack_test / len(df_test) * 100:.2f}%)")

if __name__ == "__main__":
    main()

