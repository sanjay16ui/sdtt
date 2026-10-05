from presidio_analyzer import AnalyzerEngine
from presidio_analyzer.nlp_engine import NlpEngineProvider

configuration = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}]
}

print("Setting up NlpEngineProvider with en_core_web_sm...")
provider = NlpEngineProvider(nlp_configuration=configuration)
nlp_engine = provider.create_engine()
analyzer = AnalyzerEngine(nlp_engine=nlp_engine)
print("AnalyzerEngine successfully initialized with en_core_web_sm!")

text = "Rajesh Sharma was born on 14/08/1988 living at Bengaluru, Karnataka. Email: rajesh.sharma@example.com, Phone: +91 9876543210."
results = analyzer.analyze(text=text, language='en')

print(f"\nPresidio Detection Results ({len(results)} found):")
for r in results:
    val = text[r.start:r.end]
    print(f"  Entity: {r.entity_type:<15} Value: '{val}' (score: {r.score:.2f})")
