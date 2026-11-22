"""
=============================================================================
RELIEFROUTE: AI/ML Decision-Support Microservice
FastAPI + Scikit-Learn (Random Forest, Decision Tree, Logistic Regression)
=============================================================================
"""

import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

app = FastAPI(
    title="ReliefRoute AI Decision Support Service",
    description="Machine Learning Priority Categorization & Optimization Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature Encoders
SEVERITY_MAP = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
MEDICAL_MAP = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "CRITICAL": 4}
ACCESS_MAP = {"EASY": 1, "MODERATE": 2, "HARD": 3, "EXTREME": 4}
CATEGORY_LABELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

class PredictRequest(BaseModel):
    disaster_severity: str = "MEDIUM"
    medical_urgency: str = "MODERATE"
    affected_population: int = 150
    food_needed: int = 200
    water_needed: int = 400
    medicines_needed: int = 40
    shelter_needed: int = 15
    accessibility: str = "MODERATE"

class ModelRegistry:
    def __init__(self):
        self.rf_model = None
        self.dt_model = None
        self.lr_model = None
        self.feature_names = [
            "severity_encoded",
            "medical_encoded",
            "population_norm",
            "supply_urgency",
            "access_encoded"
        ]
        self.metrics = {}
        self.train_models()

    def generate_synthetic_training_data(self, n_samples: int = 1200):
        """Generates realistic disaster triage training distribution for Uttarakhand topography."""
        np.random.seed(42)

        severities = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.20, 0.35, 0.30, 0.15])
        medicals = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.25, 0.30, 0.25, 0.20])
        accessibilities = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.25, 0.35, 0.25, 0.15])
        populations = np.random.exponential(scale=350, size=n_samples) + 20
        populations = np.clip(populations, 10, 2500)

        # Supply urgency derived from ratio
        supply_urgencies = (np.random.beta(a=2, b=3, size=n_samples) * 100)

        # Priority calculation ground-truth formula
        ground_truth_score = (
            severities * 25.0 +
            medicals * 25.0 +
            np.clip(populations / 10.0, 5, 25) +
            supply_urgencies * 0.20 +
            accessibilities * 8.0
        )
        # Add slight natural noise
        ground_truth_score += np.random.normal(0, 4.0, size=n_samples)

        categories = []
        for s in ground_truth_score:
            if s >= 155:
                categories.append("CRITICAL")
            elif s >= 125:
                categories.append("HIGH")
            elif s >= 95:
                categories.append("MEDIUM")
            else:
                categories.append("LOW")

        df = pd.DataFrame({
            "severity_encoded": severities,
            "medical_encoded": medicals,
            "population_norm": np.clip(populations / 25.0, 1, 100),
            "supply_urgency": supply_urgencies,
            "access_encoded": accessibilities,
            "target_category": categories
        })

        return df

    def train_models(self):
        print("[AI Microservice] Training Random Forest, Decision Tree & Logistic Regression models...")
        data = self.generate_synthetic_training_data()

        X = data[self.feature_names]
        y = data["target_category"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

        # 1. Random Forest Classifier
        self.rf_model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        self.rf_model.fit(X_train, y_train)
        rf_pred = self.rf_model.predict(X_test)
        rf_acc = accuracy_score(y_test, rf_pred)

        # 2. Decision Tree Classifier
        self.dt_model = DecisionTreeClassifier(max_depth=5, random_state=42)
        self.dt_model.fit(X_train, y_train)
        dt_pred = self.dt_model.predict(X_test)
        dt_acc = accuracy_score(y_test, dt_pred)

        # 3. Multinomial Logistic Regression
        self.lr_model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000, random_state=42))
        self.lr_model.fit(X_train, y_train)
        lr_pred = self.lr_model.predict(X_test)
        lr_acc = accuracy_score(y_test, lr_pred)

        self.metrics = {
            "random_forest": {
                "accuracy": round(float(rf_acc), 4),
                "model_type": "Ensemble (100 Decision Trees)",
                "depth": 8,
                "report": classification_report(y_test, rf_pred, output_dict=True, zero_division=0)
            },
            "decision_tree": {
                "accuracy": round(float(dt_acc), 4),
                "model_type": "CART Decision Tree",
                "depth": 5,
                "report": classification_report(y_test, dt_pred, output_dict=True, zero_division=0)
            },
            "logistic_regression": {
                "accuracy": round(float(lr_acc), 4),
                "model_type": "Multinomial Logistic Regression (L2)",
                "report": classification_report(y_test, lr_pred, output_dict=True, zero_division=0)
            }
        }
        print(f"[AI Microservice] Models trained! RF Acc: {rf_acc:.2%}, DT Acc: {dt_acc:.2%}, LR Acc: {lr_acc:.2%}")

    def extract_features(self, req: PredictRequest) -> np.ndarray:
        sev = SEVERITY_MAP.get(req.disaster_severity.upper(), 2)
        med = MEDICAL_MAP.get(req.medical_urgency.upper(), 2)
        acc = ACCESS_MAP.get(req.accessibility.upper(), 2)
        pop_norm = min(100.0, max(1.0, req.affected_population / 25.0))

        # Supply urgency
        per_capita = (req.food_needed + req.water_needed + req.medicines_needed) / max(1, req.affected_population)
        supply_urg = min(100.0, per_capita * 18.0)

        return np.array([[sev, med, pop_norm, supply_urg, acc]])

# Initialize registry
registry = ModelRegistry()

@app.get("/")
def root():
    return {
        "service": "ReliefRoute AI Priority Classification Service",
        "status": "ONLINE",
        "framework": "FastAPI + Scikit-learn",
        "models_loaded": ["RandomForestClassifier", "DecisionTreeClassifier", "LogisticRegression"]
    }

@app.get("/metrics")
def get_metrics():
    return {
        "status": "READY",
        "dataset_notice": "DEMO / SYNTHETIC DISASTER INCIDENT TRAINING DISTRIBUTION",
        "models": registry.metrics,
        "feature_importances": [
            {"feature": "Disaster Severity", "importance": float(registry.rf_model.feature_importances_[0])},
            {"feature": "Medical Urgency", "importance": float(registry.rf_model.feature_importances_[1])},
            {"feature": "Affected Population", "importance": float(registry.rf_model.feature_importances_[2])},
            {"feature": "Essential Shortage", "importance": float(registry.rf_model.feature_importances_[3])},
            {"feature": "Accessibility Difficulty", "importance": float(registry.rf_model.feature_importances_[4])}
        ]
    }

@app.post("/predict")
def predict_priority(req: PredictRequest):
    features = registry.extract_features(req)

    # 1. Random Forest
    rf_pred = registry.rf_model.predict(features)[0]
    rf_probs = registry.rf_model.predict_proba(features)[0]
    rf_conf = float(np.max(rf_probs))

    # 2. Decision Tree
    dt_pred = registry.dt_model.predict(features)[0]
    dt_probs = registry.dt_model.predict_proba(features)[0]
    dt_conf = float(np.max(dt_probs))

    # 3. Logistic Regression
    lr_pred = registry.lr_model.predict(features)[0]
    lr_probs = registry.lr_model.predict_proba(features)[0]
    lr_conf = float(np.max(lr_probs))

    # Consensus voting
    votes = [rf_pred, dt_pred, lr_pred]
    consensus = max(set(votes), key=votes.count)

    return {
        "consensus_category": consensus,
        "models": {
            "random_forest": {
                "prediction": rf_pred,
                "confidence": round(rf_conf, 3),
                "model_type": "Random Forest (100 Trees)",
                "training_accuracy": f"{registry.metrics['random_forest']['accuracy'] * 100:.1f}%"
            },
            "decision_tree": {
                "prediction": dt_pred,
                "confidence": round(dt_conf, 3),
                "model_type": "CART Decision Tree",
                "training_accuracy": f"{registry.metrics['decision_tree']['accuracy'] * 100:.1f}%"
            },
            "logistic_regression": {
                "prediction": lr_pred,
                "confidence": round(lr_conf, 3),
                "model_type": "Multinomial Logistic",
                "training_accuracy": f"{registry.metrics['logistic_regression']['accuracy'] * 100:.1f}%"
            }
        },
        "feature_importance": [
            {"feature": "Disaster Severity", "importance": round(float(registry.rf_model.feature_importances_[0]), 3)},
            {"feature": "Medical Urgency", "importance": round(float(registry.rf_model.feature_importances_[1]), 3)},
            {"feature": "Essential Shortage", "importance": round(float(registry.rf_model.feature_importances_[3]), 3)},
            {"feature": "Affected Population", "importance": round(float(registry.rf_model.feature_importances_[2]), 3)},
            {"feature": "Accessibility Difficulty", "importance": round(float(registry.rf_model.feature_importances_[4]), 3)}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("train_and_serve:app", host="0.0.0.0", port=8000, reload=False)
