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

        # Apply a basic time penalty if requested during night (e.g. hour >= 20 or <= 4)
        time_penalty = 0
        if req.time_of_day_hour >= 20 or req.time_of_day_hour <= 4:
            time_penalty = 10
            avg_lighting = max(1.0, avg_lighting * 0.5) # cut lighting score in half digitally
            
        final_route_score = int((average_safety * 0.7) + (min_safety * 0.3)) - time_penalty
        final_route_score = max(5, min(99, final_route_score))

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
