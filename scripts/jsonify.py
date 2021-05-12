#!/usr/local/bin/python3

import json
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

if len(df.columns) == 2:
    df.columns = ['en', 'ga']
else:
    df.columns = ['en', 'ga', 'context']

data = df.to_json(orient='records', force_ascii=False)
data = data.replace('}]', '}\n]')
data = data.replace('{', '\n  {')
data = data.replace('\n\n', '\n')

with open('translations/' + hostname + '.json', 'w') as outfile:
    outfile.write(data + '\n')
