from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="SafeRoute AI Predictor", version="1.0")

# Load the trained model on startup
model_path = os.path.join(os.path.dirname(__file__), 'safety_model.joblib')
try:
    model = joblib.load(model_path)
    print("AI Model loaded successfully.")
except Exception as e:
    print(f"Failed to load model from {model_path}. Ensure train_model.py was run.")
    model = None

class Coordinate(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    time_of_day_hour: int
    coordinates: list[Coordinate]

@app.get("/")
def read_root():
    return {"status": "AI Model Service is up and running."}

@app.post("/predict_safety")
def predict_safety(req: RouteRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Model is not loaded.")

    if not req.coordinates:
        raise HTTPException(status_code=400, detail="No coordinates provided in route.")

    # Prepare DataFrame for model
    data = []
    for coord in req.coordinates:
        data.append({
            'latitude': coord.lat,
            'longitude': coord.lng
        })
    df = pd.DataFrame(data)

    try:
        # Predictions array: [crime_rate, lighting_score, population_density, police_distance_km, safety_score]
        predictions = model.predict(df)
        
        # Aggregate across the entire physical path
        avg_crime_rate = sum(p[0] for p in predictions) / len(predictions)
        avg_lighting = sum(p[1] for p in predictions) / len(predictions)
        avg_density = sum(p[2] for p in predictions) / len(predictions)
        avg_police_dist = sum(p[3] for p in predictions) / len(predictions)
        
        safety_scores = [p[4] for p in predictions]
        average_safety = sum(safety_scores) / len(safety_scores)
        min_safety = min(safety_scores)

        # Apply the new 0-100 weighted formula based on environmental factors
        # 1. Normalize environmental metrics to a 0-10 (or 0-100) scale heuristically
        lighting_score_normalized = (min(avg_lighting, 10.0) / 10.0) * 100
        density_score_normalized = (min(avg_density, 10.0) / 10.0) * 100
        
        # 2. Calculate dynamic penalties based on the features
        crime_penalty = (min(avg_crime_rate, 10.0) / 10.0) * 40    # Up to 40 points deduced for high crime
        police_penalty = (min(avg_police_dist, 10.0) / 10.0) * 20  # Up to 20 points deduced for long distance to police
        lighting_penalty = ((100 - lighting_score_normalized) / 100) * 30 # Up to 30 points deduced for bad lighting
        
        base_score = 100
        time_penalty = 0
        
        # 3. Apply time of day multipliers (Nighttime makes lighting and crime matter more)
        if req.time_of_day_hour >= 19 or req.time_of_day_hour <= 5:
            time_penalty = 15
            lighting_penalty *= 1.5
            crime_penalty *= 1.2
            avg_lighting = max(1.0, avg_lighting * 0.5) # visually cut avg lighting for the UI metrics
            
        final_route_score = base_score - crime_penalty - lighting_penalty - police_penalty + (density_score_normalized * 0.1) - time_penalty
        final_route_score = int(max(5, min(99, final_route_score)))

        # Calculate user's exact custom Night Safety Formula
        # night_safety = (0.4*lighting) + (0.2*density) - (0.2*crime) - (0.2*police_dist)
        night_safety_raw = (0.4 * float(avg_lighting)) + (0.2 * float(avg_density)) - (0.2 * float(avg_crime_rate)) - (0.2 * float(avg_police_dist))
        
        return {
            "overall_safety_score": final_route_score,
            "average_segment_score": round(float(average_safety), 2),
            "lowest_segment_score": round(float(min_safety), 2),
            "metrics": {
                "avg_crime_rate_index": round(float(avg_crime_rate), 2),
                "avg_lighting_score": round(float(avg_lighting), 2),
                "avg_population_density_index": round(float(avg_density), 2),
                "nearest_police_avg_km": round(float(avg_police_dist), 2),
                "night_safety_score": round(night_safety_raw, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
