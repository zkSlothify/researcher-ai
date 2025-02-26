# Twitter Accounts Reference Guide

This file provides descriptions of Twitter accounts that you might want to monitor in your AI News Aggregator. Use this as a reference when editing the `config.json` file.

## AI Companies

- **OpenAI** (`OpenAI`) - Official account of OpenAI, creators of ChatGPT and GPT models
- **Google DeepMind** (`DeepMind`) - Google's AI research lab
- **Anthropic** (`AnthropicAI`) - AI safety company, creators of Claude
- **Meta AI** (`MetaAI`) - Meta's AI research division
- **Google AI** (`GoogleAI`) - Google's AI division
- **Stability AI** (`StabilityAI`) - Creators of Stable Diffusion
- **Cohere** (`Cohere`) - NLP and LLM company
- **Mistral AI** (`Mistral`) - French AI startup
- **Midjourney** (`Midjourney`) - Text-to-image AI company
- **Inflection AI** (`Inflection_AI`) - AI company focused on personal AI assistants

## AI Leaders & Researchers

- **Sam Altman** (`sama`) - CEO of OpenAI
- **Demis Hassabis** (`gdb`) - CEO of Google DeepMind
- **Jack Clark** (`jackclarkSF`) - Co-founder of Anthropic
- **Demian Brecht** (`demiandabi`) - AI researcher

## Additional Notable Accounts

- **Yann LeCun** (`ylecun`) - Chief AI Scientist at Meta
- **Andrej Karpathy** (`karpathy`) - Former Director of AI at Tesla, former OpenAI researcher
- **Jeff Dean** (`jeffdean`) - Google Senior Fellow, head of Google AI
- **Emad Mostaque** (`emostaque`) - CEO of Stability AI
- **Aidan Gomez** (`aidan_gomez`) - CEO of Cohere
- **Gary Marcus** (`garymarkus`) - AI researcher and critic
- **Melanie Mitchell** (`melaniemitchell`) - AI researcher focusing on conceptual abstraction
- **Anima Anandkumar** (`AnimaAnandkumar`) - Director of ML Research at NVIDIA, Caltech Professor
- **Margaret Mitchell** (`mmitchell_ai`) - AI ethics researcher, former Google AI
- **Timnit Gebru** (`timnitGebru`) - AI ethics researcher, former Google AI

## AI News & Media

- **The Gradient** (`thegradientpub`) - AI research publication
- **AI Breakfast** (`ai_breakfast`) - Daily AI news digest
- **Weights & Biases** (`weights_biases`) - ML platform with educational content
- **Hugging Face** (`huggingface`) - Open-source AI community
- **Scale AI** (`scale_ai`) - AI infrastructure company
- **VentureBeat AI** (`VentureBeat_AI`) - AI news from VentureBeat

## How to Use This Reference

1. Decide which accounts you want to monitor
2. Edit the `config.json` file to include only those accounts in the `usernames` array
3. Run the application with `npm start` to fetch tweets from your selected accounts

Example configuration with selected accounts:
```json
"usernames": [
  "OpenAI",
  "AnthropicAI",
  "sama",
  "karpathy",
  "huggingface"
]
``` 