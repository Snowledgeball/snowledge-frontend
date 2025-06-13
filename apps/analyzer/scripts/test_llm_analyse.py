import sys
import os
import json
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from llm.analyse import load_yaml, analyse

# Exemple de message formaté depuis MongoDB
EXAMPLE_MESSAGES = [
    "[2025-05-11 14:43] screechyroll: 🚀 Tech Behind Masterclasser\n\nMasterclasser est un bot Discord développé en Node.js avec Discord.js v14, pensé pour automatiser l'accès à des contenus éducatifs de haute qualité.\n\n🎯 Il repose sur une architecture modulaire avec :\n• Un système de rôles dynamique basé sur les interactions utilisateurs\n• Une base de données PostgreSQL pour stocker les historiques d'accès, les progrès et les scores\n• Des webhooks pour se connecter à des plateformes comme Notion, YouTube ou Google Drive\n• Une API REST pour exposer les stats de sessions et récupérer les ressources associées aux cours\n\n🔐 Sécurité : OAuth2 + permissions granulaires\n⚙️ Scalabilité : Hébergé via Docker, avec un reverse proxy Nginx + auto-restart en cas de crash\n\nMasterclasser, c'est l'intelligence d'un prof, la rigueur d'un automate, et l'accessibilité d'un bot."
]

# ============
# Function: select_from_list
# ------------
# DESCRIPTION: Prompt the user to select an item from a list.
# PARAMS:
#   - items: list of str, items to choose from
#   - prompt: str, prompt message
# RETURNS: str, selected item
# ============
def select_from_list(items, prompt):
    for idx, item in enumerate(items):
        print(f"[{idx+1}] {item}")
    while True:
        choice = input(f"{prompt} (1-{len(items)}): ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(items):
            return items[int(choice)-1]
        print("Invalid choice. Try again.")

# ============
# Function: main
# ------------
# DESCRIPTION: Entry point for interactive test script. Lists models/prompts, lets user select, et propose un exemple de message formaté.
# PARAMS: None
# RETURNS: None
# ============
def main():
    llm_path = Path(__file__).parent.parent / 'llm' / 'llm_models.yaml'
    prompt_path = Path(__file__).parent.parent / 'llm' / 'prompt_models.yaml'
    llm_config = load_yaml(str(llm_path))
    prompt_config = load_yaml(str(prompt_path))

    # List all models
    all_models = []
    for section in ['llm_models', 'lrm_models', 'vlm_models']:
        all_models.extend([m['name'] for m in llm_config.get(section, [])])
    print("\nAvailable models:")
    model_name = select_from_list(all_models, "Select a model")

    # List all prompts
    all_prompts = list(prompt_config.get('prompt_models', {}).keys())
    print("\nAvailable prompts:")
    prompt_name = select_from_list(all_prompts, "Select a prompt")

    # Choix du mode de test
    print("\n[1] Utiliser l'exemple de message MongoDB fourni")
    print("[2] Saisie manuelle de messages")
    mode = input("Choisir une option (1-2): ").strip()
    if mode == '1':
        messages = EXAMPLE_MESSAGES
        print("\nMessage utilisé:")
        print(messages[0])
    else:
        print("\nEnter your messages (one per line, empty line to finish):")
        messages = []
        while True:
            msg = input()
            if msg.strip() == '':
                break
            messages.append(msg)
        if not messages:
            print("No messages entered. Exiting.")
            return

    # Ask for streaming
    stream = input("Enable streaming output? (y/N): ").strip().lower() == 'y'

    try:
        if stream:
            print("\nStreaming output:")
            for chunk in analyse(model_name, prompt_name, messages, stream=True):
                print(chunk, end='', flush=True)
            print()
        else:
            result = analyse(model_name, prompt_name, messages)
            print("\nResult:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()