import pandas as pd

def parse_and_map_ncrb():
    # 1. Load the provided dataset
    input_csv = r"c:\Users\RUDRA_JOSHI\Downloads\NCRB_CII-2019_Table_19B.2.csv"
    try:
        df = pd.read_csv(input_csv)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # 2. Extract City Name and Total Crimes (ignoring the 'Grand Total' row)
    # The columns in the CSV are specific. We need the 'City' column and the last column "Total   - Total Persons Arrested by age and Sex"
    # Let's clean the column names first
    df.columns = [col.strip() for col in df.columns]
    
    # Let's get the absolute total column (last one)
    total_col = df.columns[-1]
    
    # Filter out the Grand Total row
    city_df = df[df['City'] != 'TOTAL CITIES'].copy()
    
    # 3. Create a static mapping of these specific cities to their rough Coordinates (Latitude, Longitude)
    city_coordinates = {
        "Ahmedabad (Gujarat)": (23.0225, 72.5714),
        "Bengaluru(Karnataka)": (12.9716, 77.5946),
        "Chennai(Tamil Nadu)": (13.0827, 80.2707),
        "Coimbatore(Tamil Nadu)": (11.0168, 76.9558),
        "Delhi": (28.7041, 77.1025),
        "Ghaziabad(Uttar Pradesh)": (28.6692, 77.4538),
        "Hyderabad(Telangana)": (17.3850, 78.4867),
        "Indore(Madhya Pradesh)": (22.7196, 75.8577),
        "Jaipur(Rajasthan)": (26.9124, 75.7873),
        "Kanpur(Uttar Pradesh)": (26.4499, 80.3319),
        "Kochi(Kerala)": (9.9312, 76.2673),
        "Kolkata(West Bengal)": (22.5726, 88.3639),
        "Kozhikode(Kerala)": (11.2588, 75.7804),
        "Lucknow(Uttar Pradesh)": (26.8467, 80.9462),
        "Mumbai(Maharashtra)": (19.0760, 72.8777),
        "Nagpur(Maharashtra)": (21.1458, 79.0882),
        "Patna(Bihar)": (25.5941, 85.1376),
        "Pune(Maharashtra)": (18.5204, 73.8567),
        "Surat(Gujarat)": (21.1702, 72.8311)
    }

    # Clean the 'City' column to match dictionary keys just in case
    city_df['City_Clean'] = city_df['City'].str.strip()
    
    mapped_data = []

    # Map the crime data to the coordinates
    for idx, row in city_df.iterrows():
        city = row['City_Clean']
        total_arrests = row[total_col]
        
        if city in city_coordinates:
            lat, lng = city_coordinates[city]
            mapped_data.append({
                "city": city,
                "latitude": lat,
                "longitude": lng,
                "total_crimes": total_arrests
            })
            
    mapped_df = pd.DataFrame(mapped_data)
    
    # 4. Normalize the data to create a "Safety Score" out of 100
    # Higher crimes = lower safety score
    max_crimes = mapped_df['total_crimes'].max()
    min_crimes = mapped_df['total_crimes'].min()
    
    def calculate_safety(crimes):
        # Inverse normalization: (max - current) / (max - min) * 100
        # This means the city with the highest crime gets 0 (or close to 0) and lowest gets 100
        # We will bound it between 10 and 95 so it's realistic
        raw_score = ((max_crimes - crimes) / (max_crimes - min_crimes)) * 100
        return max(10, min(95, int(raw_score)))

    mapped_df['base_safety_score'] = mapped_df['total_crimes'].apply(calculate_safety)
    
    # 5. Expand this out into a much larger dataset simulating random points around these cities
    import random
    import numpy as np

    NUM_SAMPLES = 10000
    expanded_data = []

    print(f"Expanding dataset to {NUM_SAMPLES} training points based on true NCRB data...")
    for _ in range(NUM_SAMPLES):
        # Pick a random city base
        city_row = mapped_df.sample(1).iloc[0]
        
        # Add slight geographic variance (simulate points within the city)
        lat_variance = random.uniform(-0.15, 0.15)
        lng_variance = random.uniform(-0.15, 0.15)
        
        # Add Time factor (night is less safe)
        hour = random.randint(0, 23)
        time_penalty = 0
        if hour >= 22 or hour <= 4:
            time_penalty = 20
        elif 18 <= hour <= 21:
            time_penalty = 10
            
        final_score = city_row['base_safety_score'] - time_penalty
        final_score = max(5, min(100, int(final_score)))
        
        expanded_data.append({
            'latitude': city_row['latitude'] + lat_variance,
            'longitude': city_row['longitude'] + lng_variance,
            'hour': hour,
            'safety_score': final_score,
            'is_safe': 1 if final_score > 50 else 0
        })

    final_df = pd.DataFrame(expanded_data)
    
    import os
    output_path = os.path.join(r"c:\Users\RUDRA_JOSHI\OneDrive\Desktop\ai_marathon\ai_service", 'historical_safety_data.csv')
    final_df.to_csv(output_path, index=False)
    
    print(f"Successfully digested NCRB Data and exported expanded training set to {output_path}")

if __name__ == "__main__":
    parse_and_map_ncrb()
