import time
print("Testing Presidio with en_core_web_sm...")
t0 = time.time()
from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider

configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}]
}
provider = NlpEngineProvider(nlp_configuration=configuration)
nlp_engine = provider.create_engine()
analyzer = AnalyzerEngine(nlp_engine=nlp_engine)

text = "Aadhaar UID: 8492 1204 9912. Rajesh Sharma was born on 14/08/1988 living at Bengaluru, Karnataka. PAN: ABCDE1234F. Email: rajesh@example.com."
results = analyzer.analyze(text=text, language='en')

print(f"Presidio loaded and analyzed in {time.time() - t0:.2f}s! Found {len(results)} entities:")
for r in results:
    print(f"  {r.entity_type} -> '{text[r.start:r.end]}' (score: {r.score:.2f})")
