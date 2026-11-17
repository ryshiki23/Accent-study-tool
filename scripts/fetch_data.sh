#!/usr/bin/env bash
# Download the raw sources for build_dataset.py into data/raw
set -euo pipefail
cd "$(dirname "$0")/../data/raw"
GH=https://raw.githubusercontent.com
curl -sSL -o cmudict.dict  $GH/cmusphinx/cmudict/master/cmudict.dict
curl -sSL -o britfone.csv  $GH/JoseLlarena/Britfone/master/britfone.main.3.0.1.csv
curl -sSL -o homographs.en $GH/Kyubyong/g2p/master/g2p_en/homographs.en
curl -sSL -o ngsl.json     $GH/lpmi-13/machine_readable_wordlists/master/General/NGSL/NGSL.json
curl -sSL -o nawl.json     $GH/lpmi-13/machine_readable_wordlists/master/Academic/NAWL/NAWL.json
curl -sSL -o AWL.json      $GH/lpmi-13/machine_readable_wordlists/master/Academic/AWL/AWL.json
mkdir -p ~/nltk_data/corpora
curl -sSL -o ~/nltk_data/corpora/wordnet.zip $GH/nltk/nltk_data/gh-pages/packages/corpora/wordnet.zip
(cd ~/nltk_data/corpora && unzip -q -o wordnet.zip && chmod -R go-w .)
echo "done. Python deps: pip install nltk pyphen wordfreq better_profanity"
