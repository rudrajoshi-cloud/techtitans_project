import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os

def train():
    # Use the new rich dataset
    data_path = r"c:\Users\RUDRA_JOSHI\Downloads\india_safety_locations_500.csv"
    model_path = os.path.join(os.path.dirname(__file__), 'safety_model.joblib')

    if not os.path.exists(data_path):
        print(f"Error: Training data not found at {data_path}.")
        return

    import io
    print("Loading rich spatial dataset...")
    
    # The new CSV wraps the entire line in quotes. We strip them in-memory first.
    with open(data_path, 'r', encoding='utf-8') as f:
        clean_csv_string = f.read().replace('"', '')
        
    # Skip lines having extraneous commas in place_name (like 'Sector 22, Dwarka') instead of crashing
    df = pd.read_csv(io.StringIO(clean_csv_string), on_bad_lines='skip')

    # Features: Latitude, Longitude
    X = df[['latitude', 'longitude']]
    
    # Targets: We want to predict ALL these environmental features for any arbitrary point on a map
    y = df[['crime_rate', 'lighting_score', 'population_density', 'police_distance_km', 'safety_score']]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Multi-Target Random Forest Regressor...")
    # RandomForestRegressor inherently supports multi-output regression
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    
    print(f"Model Training Complete! Overall Multi-Target Mean Absolute Error: {mae:.2f}")

    # Save the model
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train()
