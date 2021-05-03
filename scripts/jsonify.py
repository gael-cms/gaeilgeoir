#!/usr/local/bin/python3

import pandas as pd
import sys

if len(sys.argv) != 2:
    print("Please provide a filename")
    sys.exit(1)

filename = sys.argv[1]
if filename.endswith(".csv"):
    hostname = filename[:-4].split("/")[-1]
else:
    hostname = filename.split("/")[-1]

df = pd.read_csv (filename)
df = df.dropna()
df.columns = ['en', 'ga']
print(df)
df.to_json (r'translations/' + hostname + '.json', orient='records', indent=2, force_ascii=False)

