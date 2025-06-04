import requests
import yaml
from pathlib import Path
from typing import List, Union, Generator, Optional
from config.config import get_env_var

# ============
# Function: load_yaml
# ------------
# DESCRIPTION: Load a YAML file and return its content as a dictionary.
# PARAMS:
#   - file_path: str, path to the YAML file
# RETURNS: dict, parsed YAML content
# ============
def load_yaml(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

# ============
# Function: get_model_config
# ------------
# DESCRIPTION: Retrieve the configuration for a given model name from llm_models.yaml.
# PARAMS:
#   - model_name: str, name of the model
# RETURNS: dict, model configuration
# ============
def get_model_config(model_name: str) -> dict:
    llm_path = Path(__file__).parent / 'llm_models.yaml'
    config = load_yaml(str(llm_path))
    for section in ['llm_models', 'lrm_models', 'vlm_models']:
        for model in config.get(section, []):
            if model.get('name') == model_name:
                return model
    raise ValueError(f"Model '{model_name}' not found in llm_models.yaml.")

# ============
# Function: get_prompt_config
# ------------
# DESCRIPTION: Retrieve the configuration for a given prompt name from prompt_models.yaml.
# PARAMS:
#   - prompt_name: str, name of the prompt
# RETURNS: dict, prompt configuration
# ============
def get_prompt_config(prompt_name: str) -> dict:
    prompt_path = Path(__file__).parent / 'prompt_models.yaml'
    config = load_yaml(str(prompt_path))
    prompts = config.get('prompt_models', {})
    if prompt_name not in prompts:
        raise ValueError(f"Prompt '{prompt_name}' not found in prompt_models.yaml.")
    return prompts[prompt_name]

# ============
# Function: build_payload
# ------------
# DESCRIPTION: Build the payload for the OVH API request based on model, prompt, user content, and streaming option.
# PARAMS:
#   - model_config: dict, model configuration
#   - prompt_config: dict, prompt configuration
#   - user_content: str or list, user input or messages
#   - stream: bool, whether to enable streaming
#   - extra: dict, additional parameters (optional)
# RETURNS: dict, payload for the API
# ============
def build_payload(model_config: dict, prompt_config: dict, user_content: Union[str, List[str]], stream: bool = False, extra: Optional[dict] = None) -> dict:
    messages = []
    # Toujours convertir user_content en string si c'est une liste
    if isinstance(user_content, list):
        user_content_str = '\n'.join(user_content)
    else:
        user_content_str = user_content
    # Add system/user messages
    for msg in prompt_config.get('messages', []):
        content = msg['content']
        # Remplacement {{question}} ou {{messages}} si présent
        if '{{question}}' in content or '{{messages}}' in content:
            content = content.replace('{{question}}', user_content_str)
            content = content.replace('{{messages}}', user_content_str)
        messages.append({
            'role': msg['role'],
            'content': content
        })
    # Prendre temperature/top_p du prompt_config si dispo, sinon du model_config, sinon défaut
    temperature = prompt_config.get('temperature', model_config.get('temperature', 0.3))
    top_p = prompt_config.get('top_p', model_config.get('top_p', 0.8))
    payload = {
        'max_tokens': model_config.get('context_window', 512),
        'messages': messages,
        'model': model_config.get('name'),
        'temperature': temperature,
        'top_p': top_p,
        'stream': stream
    }
    # Add response_format if present
    if 'response_format' in prompt_config:
        payload['response_format'] = prompt_config['response_format']
    # Merge extra parameters if provided
    if extra:
        payload.update(extra)
    return payload

# ============
# Function: call_ovh_api
# ------------
# DESCRIPTION: Send a POST request to the OVH API with the given payload and headers. Supports streaming.
# PARAMS:
#   - payload: dict, request payload
#   - stream: bool, whether to enable streaming
# RETURNS: dict (if not streaming) or generator (if streaming)
# ============
def call_ovh_api(payload: dict, stream: bool = False) -> Union[dict, Generator[str, None, None]]:
    url = get_env_var('OVH_API_BASE_URL', 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions')
    token = get_env_var('OVH_AI_ENDPOINTS_ACCESS_TOKEN')
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    response = requests.post(url, json=payload, headers=headers, stream=stream, timeout=60)
    if stream:
        def stream_generator():
            for line in response.iter_lines():
                if line:
                    yield line.decode('utf-8')
        return stream_generator()
    else:
        if response.status_code == 200:
            return response.json()
        else:
            raise RuntimeError(f"OVH API error: {response.status_code} - {response.text}")

# ============
# Function: analyse
# ------------
# DESCRIPTION: Main entry point. Prepares and sends a request to the OVH API using the specified model and prompt.
# PARAMS:
#   - model_name: str, name of the model
#   - prompt_name: str, name of the prompt
#   - user_content: str or list, user input or messages
#   - stream: bool, whether to enable streaming (default: False)
#   - extra: dict, additional parameters (optional)
# RETURNS: dict (if not streaming) or generator (if streaming)
# ============
def analyse(model_name: str, prompt_name: str, user_content: Union[str, List[str]], stream: bool = False, extra: Optional[dict] = None) -> Union[dict, Generator[str, None, None]]:
    model_config = get_model_config(model_name)
    prompt_config = get_prompt_config(prompt_name)
    payload = build_payload(model_config, prompt_config, user_content, stream=stream, extra=extra)
    return call_ovh_api(payload, stream=stream)