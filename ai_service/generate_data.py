import pandas as pd
import numpy as np
import random
import os

# Set a seed so the mock data is reproducible
np.random.seed(42)
random.seed(42)

NUM_SAMPLES = 5000

# We will generate mock data roughly bounding a city (e.g., Delhi coordinates)
# Lat: 28.40 to 28.80, Lng: 76.80 to 77.40
def generate_mock_data(num_samples):
    data = []
    
    for _ in range(num_samples):
        lat = random.uniform(28.40, 28.80)
        lng = random.uniform(76.80, 77.40)
        
        # Hour of the day (0-23)
        hour = random.randint(0, 23)
        
        # We simulate that late-night hours (22-04) might be historically less safe
        # We also simulate that some specific sub-regions might be less safe.
        
        danger_factor = 0
        if 22 <= hour or hour <= 4:
            danger_factor += 0.4  # high penalty for late night
        elif 18 <= hour <= 21:
            danger_factor += 0.15 # evening
            
        # Simulate a specific "unsafe area" bounds
        if 28.55 <= lat <= 28.65 and 77.10 <= lng <= 77.20:
            danger_factor += 0.3
            
        # Add random noise
        danger_factor += random.uniform(-0.1, 0.2)
        
        # Calculate safety score (0 to 100)
        base_safety = 95
        safety_score = max(10, min(100, int(base_safety - (danger_factor * 100))))
        
        # Determine strict label for training purposes (Safe = 1, Unsafe = 0)
        is_safe = 1 if safety_score > 60 else 0
        
        data.append({
            'latitude': lat,
            'longitude': lng,
            'hour': hour,
            'safety_score': safety_score,
            'is_safe': is_safe
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    print(f"Generating {NUM_SAMPLES} rows of synthetic historical safety data...")
    df = generate_mock_data(NUM_SAMPLES)
    
    output_path = os.path.join(os.path.dirname(__file__), 'historical_safety_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Dataset generated successfully at: {output_path}")
    print(df.head())
