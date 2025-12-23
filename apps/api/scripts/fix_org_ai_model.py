import os
import sys
import json

# Dynamically calculate the absolute path to the `src` directory
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.abspath(os.path.join(current_dir, '..'))
src_dir = os.path.join(api_dir, 'src')

# Add the `src` directory to Python path
sys.path.insert(0, src_dir)

# Debugging: Print the sys.path to verify
print("Python Path:", sys.path)

from sqlmodel import Session, select
from src.db.organization_config import OrganizationConfig
from config.config import get_learnhouse_config
from src.core.events.database import engine

def fix_ai_model():
    with Session(engine) as session:
        org_configs = session.exec(select(OrganizationConfig)).all()
        for org_config in org_configs:
            config = org_config.config
            ai_model = config.get('features', {}).get('ai', {}).get('model', None)
            if ai_model and ai_model != 'gpt-oss:120b-cloud':
                print(f"Updating org {org_config.org_id} from {ai_model} to gpt-oss:120b-cloud")
                config['features']['ai']['model'] = 'gpt-oss:120b-cloud'
                org_config.config = config
                session.add(org_config)
        session.commit()
        print("Done updating org configs.")

if __name__ == "__main__":
    fix_ai_model()
