# edge-tts o'rami: agent proksisi (o'z sertifikati) bo'lsa, o'shani ishlatadi. Argumentlar edge-tts bilan bir xil.
import os, sys
CA = os.environ.get('TTS_CA') or '/root/.ccr/ca-bundle.crt'
if os.path.exists(CA):
    import certifi
    certifi.where = lambda: CA
from edge_tts.__main__ import main
sys.argv = ['edge-tts'] + sys.argv[1:]
main()
